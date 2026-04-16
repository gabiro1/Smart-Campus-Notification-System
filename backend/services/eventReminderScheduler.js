import { Queue } from 'bullmq';
import redisConnection from '../config/redisConfig.js';
import Event from '../modules/event/model/Event.js';
import EventRSVP from '../modules/event/model/EventRSVP.js';
import User from '../modules/user/model/User.js';
import NotificationLog from '../modules/notification/models/NotificationLog.js';
import crypto from 'crypto';
import { getPersonalizedContentBatch } from './aiPersonalizationService.js';
import { shouldSendNow } from '../utils/quietHours.js';
import { sendSMSViaTwilio } from './smsService.js';

/**
 * Event Reminder Queue
 * -------------------
 * Handles delayed reminder dispatch for events (T-24h and T-1h).
 *
 * Jobs are scheduled when an event is approved and automatically
 * removed/updated when event times change or events are cancelled.
 */
export const eventReminderQueue = new Queue('event-reminder-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 5000,
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours for debugging
    },
  },
});

console.log('📦 BullMQ: Event Reminder Queue Initialized');

/**
 * Generate idempotent job ID for an event reminder
 * Ensures we don't schedule duplicate reminder jobs for the same event+timing
 */
const generateReminderJobId = (eventId, reminderType) => {
  const hash = crypto.createHash('md5')
    .update(`${eventId}-${reminderType}`)
    .digest('hex');
  return `reminder_${reminderType}_${hash}`;
};

/**
 * Schedule reminder jobs for an approved event
 * Creates two delayed jobs: one for 24h before, one for 1h before
 *
 * @param {string} eventId - MongoDB ObjectId of the event
 */
export const scheduleEventReminders = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    if (event.status !== 'approved') {
      console.log(`[ReminderScheduler] Event ${eventId} is not approved, skipping reminder scheduling`);
      return;
    }

    if (!event.date || !event.time) {
      console.log(`[ReminderScheduler] Event ${eventId} missing date/time, skipping reminder scheduling`);
      return;
    }

    // Combine date and time into a single Date object
    const eventDateTime = new Date(event.date);
    let hours, minutes;

    // Parse time string (support "HH:MM" or "HH:MM AM/PM")
    const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      // Fallback: split by colon
      const parts = event.time.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    }

    // Validate numbers
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format for event ${eventId}: ${event.time}`);
    }

    eventDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const reminderTypes = ['24h', '1h'];
    const reminderDelays = {
      '24h': 24 * 60 * 60 * 1000, // 24 hours in ms
      '1h': 60 * 60 * 1000        // 1 hour in ms
    };

    const scheduledJobs = [];

    for (const type of reminderTypes) {
      const reminderTime = new Date(eventDateTime.getTime() - reminderDelays[type]);

      // Only schedule if reminder time is in the future
      if (reminderTime <= now) {
        console.log(`[ReminderScheduler] Reminder ${type} for event ${eventId} is in the past, skipping`);
        continue;
      }

      const delay = reminderTime.getTime() - now.getTime();
      const jobId = generateReminderJobId(eventId, type);

      // Check if job already exists (idempotency)
      const existingJob = await eventReminderQueue.getJob(jobId);
      if (existingJob) {
        console.log(`[ReminderScheduler] Reminder job ${jobId} already exists, skipping`);
        continue;
      }

      // Schedule the delayed job
      const job = await eventReminderQueue.add(
        'send-event-reminder',
        {
          eventId: eventId.toString(),
          reminderType: type,
          eventTitle: event.title,
          eventDateTime: eventDateTime.toISOString(),
          eventLocation: event.location || '',
        },
        {
          jobId,
          delay: delay,
          removeOnComplete: { age: 24 * 3600 },
          removeOnFail: { age: 24 * 3600 },
        }
      );

      scheduledJobs.push({ type, jobId, delay: Math.round(delay / 1000) });
      console.log(`[ReminderScheduler] Scheduled ${type} reminder for event ${eventId} in ${Math.round(delay / 1000)}s`);
    }

    return scheduledJobs;
  } catch (error) {
    console.error('[ReminderScheduler] Error scheduling reminders:', error);
    throw error;
  }
};

/**
 * Cancel all reminder jobs for an event
 * Called when event is cancelled or deleted
 *
 * @param {string} eventId - MongoDB ObjectId of the event
 */
export const cancelEventReminders = async (eventId) => {
  try {
    const reminderTypes = ['24h', '1h'];
    const cancelledJobs = [];

    for (const type of reminderTypes) {
      const jobId = generateReminderJobId(eventId, type);
      const job = await eventReminderQueue.getJob(jobId);

      if (job) {
        await job.remove();
        cancelledJobs.push(jobId);
        console.log(`[ReminderScheduler] Cancelled reminder job ${jobId} for event ${eventId}`);
      }
    }

    return cancelledJobs;
  } catch (error) {
    console.error('[ReminderScheduler] Error cancelling reminders:', error);
    throw error;
  }
};

/**
 * Update reminder jobs when event time changes
 * Removes old jobs and schedules new ones with updated times
 *
 * @param {string} eventId - MongoDB ObjectId of the event
 */
export const updateEventReminders = async (eventId) => {
  try {
    // Cancel existing jobs
    await cancelEventReminders(eventId);

    // Schedule new jobs with updated time
    const scheduledJobs = await scheduleEventReminders(eventId);

    console.log(`[ReminderScheduler] Updated reminder jobs for event ${eventId}`);
    return scheduledJobs;
  } catch (error) {
    console.error('[ReminderScheduler] Error updating reminders:', error);
    throw error;
  }
};

/**
 * Helper: Fetch users who should receive event reminders
 * Combines RSVP'd "going" users with targetScope users who haven't declined
 *
 * @param {string} eventId - MongoDB ObjectId of the event
 * @returns {Array} Array of User documents with fcmToken, email, etc.
 */
export const getReminderRecipients = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // 1. Get users who RSVP'd "going"
    const goingRSVPs = await EventRSVP.find({ eventId, status: 'going' })
      .populate('userId', 'fcmToken email role name phoneNumber notificationPreferences')
      .lean();

    const goingUserIds = goingRSVPs.map(rsvp => rsvp.userId._id.toString());
    const goingUsers = goingRSVPs.map(rsvp => rsvp.userId);

    // 2. Get users within targetScope who haven't declined (excluding those already going)
    const targetQuery = {};

    if (event.targetSchool) targetQuery.school = event.targetSchool;
    if (event.targetDept) targetQuery.department = event.targetDept;
    if (event.targetLevel) targetQuery.level = event.targetLevel;

    // Exclude users who have declined
    const declinedRSVPs = await EventRSVP.find({ eventId, status: 'declined' })
      .populate('userId', '_id');
    const declinedUserIds = declinedRSVPs.map(rsvp => rsvp.userId._id.toString());

    // Combine excluded IDs: declined + already going
    const excludedIds = [...declinedUserIds, ...goingUserIds];

    if (Object.keys(targetQuery).length > 0) {
      targetQuery._id = { $nin: excludedIds };
      const scopeUsers = await User.find(targetQuery)
        .select('fcmToken email role name phoneNumber notificationPreferences')
        .lean();

      // Merge and deduplicate by _id
      const allUsers = [...goingUsers, ...scopeUsers];
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user._id.toString(), user])).values()
      );

      return uniqueUsers;
    } else {
      // No targetScope defined, only send to RSVP'd going users
      return goingUsers;
    }
  } catch (error) {
    console.error('[ReminderScheduler] Error fetching recipients:', error);
    return [];
  }
};

/**
 * Send reminder notification to event recipients
 * Core worker logic with AI personalization
 *
 * @param {string} eventId - Event ID
 * @param {string} reminderType - '24h' or '1h'
 * @param {string} eventTitle - Event title
 * @param {string} eventDateTime - ISO string of event datetime
 * @param {string} eventLocation - Event location
 */
export const sendEventReminder = async (eventId, reminderType, eventTitle, eventDateTime, eventLocation) => {
  try {
    // Re-fetch event to ensure it still exists and is approved
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'approved') {
      console.log(`[ReminderScheduler] Event ${eventId} not found or not approved, skipping reminder`);
      return { success: false, message: 'Event not found or not approved' };
    }

    // Get recipients (with roles for personalization)
    const recipients = await getReminderRecipients(eventId);
    if (recipients.length === 0) {
      console.log(`[ReminderScheduler] No recipients for event ${eventId}, skipping reminder`);
      return { success: false, message: 'No recipients' };
    }

    // Calculate hours until event
    const eventDate = new Date(eventDateTime);
    const now = new Date();
    const hoursUntil = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    // Base notification content
    const baseTitle = `⏰ Event Reminder: ${eventTitle}`;
    const baseMessage = `${eventTitle} starts in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}.${eventLocation ? ` Location: ${eventLocation}` : ''}`;

    // ==========================================
    // AI PERSONALIZATION: Generate variants per role
    // ==========================================
    let personalizedMap;
    try {
      personalizedMap = await getPersonalizedContentBatch(baseTitle, baseMessage, recipients);
    } catch (err) {
      console.error('[Personalization] Failed in sendEventReminder, using generic content:', err.message);
      personalizedMap = new Map();
      recipients.forEach(u => personalizedMap.set(u._id.toString(), { title: baseTitle, message: baseMessage }));
    }

    // Create personalized notification logs
    const notificationDocs = recipients.map(user => {
      const variant = personalizedMap.get(user._id.toString()) || { title: baseTitle, message: baseMessage };
      return {
        studentId: user._id,
        senderId: event.createdBy,
        title: variant.title,
        message: variant.message,
        type: 'reminder',
        status: 'unread',
        referenceId: eventId,
      };
    });

    await NotificationLog.insertMany(notificationDocs);
    console.log(`[ReminderScheduler] Created ${notificationDocs.length} personalized reminder notifications for ${reminderType} before event ${eventId}`);

    // Send personalized push notifications, respecting quiet hours
    const eventPriority = event.priority || 'medium';
    const validRecipients = recipients.filter(u => {
      const hasToken = u.fcmToken && u.fcmToken.trim() !== "";
      if (!hasToken) return false;
      // Check quiet hours: only send if canSendNow returns true
      return shouldSendNow(u, eventPriority);
    });

    if (validRecipients.length > 0) {
      // Group tokens by variant
      const tokenGroups = new Map();
      validRecipients.forEach(user => {
        const variant = personalizedMap.get(user._id.toString()) || { title: baseTitle, message: baseMessage };
        const key = `${variant.title}|||${variant.message}`;
        if (!tokenGroups.has(key)) tokenGroups.set(key, { title: variant.title, body: variant.message, tokens: [] });
        tokenGroups.get(key).tokens.push(user.fcmToken);
      });

      const { sendMulticastNotification } = await import('../../config/firebaseAdmin.js');
      const pushPromises = [];
      for (const { title, body, tokens } of tokenGroups.values()) {
        pushPromises.push(
          sendMulticastNotification(tokens, title, body).catch(err => {
            console.error(`[Personalization] Reminder push failed for ${tokens.length} tokens:`, err.message);
          })
        );
      }
      await Promise.all(pushPromises);
      console.log(`[ReminderScheduler] Sent personalized push notifications to ${validRecipients.length} devices`);
    }

    // SMS for users with phone number and SMS enabled for reminders
    const smsRecipients = recipients.filter(u => {
      if (!u.phoneNumber) return false;
      const prefs = u.notificationPreferences || {};
      const categoryPrefs = prefs.categories?.reminders || {};
      return categoryPrefs.sms ?? prefs.sms ?? false;
    });

    const smsPromises = smsRecipients.map(user => {
      const smsText = `${baseTitle}: ${baseMessage.substring(0, 137)}`;
      return sendSMSViaTwilio(user.phoneNumber, smsText)
        .then(result => {
          console.log(`[ReminderScheduler] SMS sent to ${user.phoneNumber} (SID: ${result.sid})`);
          return result;
        })
        .catch(err => {
          console.warn(`[ReminderScheduler] SMS failed for user ${user._id} (${user.phoneNumber}):`, err.message);
          return { sid: null, error: err.message };
        });
    });

    if (smsRecipients.length > 0) {
      Promise.allSettled(smsPromises).then(results => {
        const successful = results.filter(r => r.status === 'fulfilled' && r.value?.sid).length;
        console.log(`[ReminderScheduler] SMS: ${successful}/${smsRecipients.length} delivered for ${reminderType} reminder`);
      });
    }

    return { success: true, recipientsCount: recipients.length };
  } catch (error) {
    console.error('[ReminderScheduler] Error sending reminder:', error);
    throw error;
  }
};
