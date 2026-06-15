import { Worker } from 'bullmq';
import redisConnection from '../config/redisConfig.js';
import Reminder from '../modules/reminder/model/Reminder.js';
import ReminderRecipient from '../modules/reminder/model/ReminderRecipient.js';
import NotificationLog from '../modules/notification/models/NotificationLog.js';
import User from '../modules/user/model/User.js';
import { io } from '../utils/socketServer.js';
import { sendMulticastNotification } from '../config/firebaseAdmin.js';
import { shouldSendNow } from '../utils/quietHours.js';
import { sendSMSViaTwilio } from '../services/smsService.js';

const resolveRecipients = async (reminder) => {
  if (reminder.targetAudience === 'self' || !reminder.targetId) {
    const user = await User.findById(reminder.createdBy)
      .select('fcmToken email phoneNumber notificationPreferences role name');
    return user ? [user] : [];
  }

  const query = {};
  switch (reminder.targetAudience) {
    case 'class':
      query.classId = reminder.targetId;
      break;
    case 'department':
      query.department = reminder.targetId;
      break;
    case 'school':
      query.school = reminder.targetId;
      break;
    case 'college':
      query.college = reminder.targetId;
      break;
  }

  return await User.find(query)
    .select('fcmToken email phoneNumber notificationPreferences role name')
    .lean();
};

const deliverToRecipient = async (recipient, reminder, transporter) => {
  const prefs = recipient.notificationPreferences || {};
  const categoryPrefs = prefs.categories?.reminders || {};
  const userId = recipient._id || recipient._id?.toString();
  const channels = [];
  const attempts = [];
  const isCritical = reminder.priority === 'critical';
  const canSend = isCritical || shouldSendNow(recipient, reminder.priority);

  const title = ` Reminder: ${reminder.title}`;
  const body = reminder.description || `You have a reminder: ${reminder.title}`;

  // 1. In-App (Always)
  try {
    await NotificationLog.create({
      studentId: userId,
      recipientId: userId,
      senderId: reminder.createdBy,
      title,
      message: body,
      type: 'reminder',
      status: 'unread',
      priority: reminder.priority === 'critical' ? 'critical' : reminder.priority === 'high' ? 'high' : 'medium',
      referenceId: reminder._id,
    });
    channels.push('in_app');
    attempts.push({ channel: 'in_app', sentAt: new Date(), status: 'sent' });
  } catch (err) {
    attempts.push({ channel: 'in_app', sentAt: new Date(), status: 'failed', error: err.message });
  }

  // 2. WebSocket
  try {
    if (io) {
      io.to(`user_${userId}`).emit('notification:new', {
        title,
        message: body,
        type: 'reminder',
        status: 'unread',
        priority: reminder.priority,
        referenceId: reminder._id,
        createdAt: new Date(),
      });
    }
  } catch (_) {}

  // 3. Push Notification
  const pushEnabled = categoryPrefs.push ?? prefs.push ?? true;
  if (recipient.fcmToken && pushEnabled && canSend) {
    try {
      await sendMulticastNotification(
        [recipient.fcmToken],
        { title, body: body.substring(0, 80) }
      );
      channels.push('push');
      attempts.push({ channel: 'push', sentAt: new Date(), status: 'sent' });
    } catch (err) {
      attempts.push({ channel: 'push', sentAt: new Date(), status: 'failed', error: err.message });
    }
  }

  // 4. Email
  const emailEnabled = categoryPrefs.email ?? prefs.email ?? true;
  if (recipient.email && emailEnabled && canSend) {
    try {
      await transporter?.sendMail({
        from: `"UniNotify AI" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: title,
        html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:8px">
               <h2 style="color:#1e40af;">${title}</h2>
               <p>${body}</p></div>`,
      });
      channels.push('email');
      attempts.push({ channel: 'email', sentAt: new Date(), status: 'sent' });
    } catch (err) {
      attempts.push({ channel: 'email', sentAt: new Date(), status: 'failed', error: err.message });
    }
  }

  // 5. SMS
  const smsEnabled = categoryPrefs.sms ?? prefs.sms ?? false;
  if (recipient.phoneNumber && smsEnabled && canSend) {
    try {
      const smsText = `${title}: ${body.substring(0, 140)}`;
      await sendSMSViaTwilio(recipient.phoneNumber, smsText);
      channels.push('sms');
      attempts.push({ channel: 'sms', sentAt: new Date(), status: 'sent' });
    } catch (err) {
      attempts.push({ channel: 'sms', sentAt: new Date(), status: 'failed', error: err.message });
    }
  }

  const delivered = attempts.filter(a => a.status === 'sent');
  const failed = attempts.filter(a => a.status === 'failed');

  return {
    recipientId: userId,
    channels,
    deliveryStatus: delivered.length > 0 ? (failed.length === 0 ? 'delivered' : 'sent') : 'failed',
    deliveryChannel: channels[0] || null,
    sentAt: new Date(),
    attempts,
    failureReason: failed.length > 0 ? failed.map(f => `${f.channel}: ${f.error}`).join('; ') : null
  };
};

export { resolveRecipients, deliverToRecipient };

export const reminderWorker = new Worker('reminder-queue', async (job) => {
  const { reminderId } = job.data;
  console.log(` Processing reminder job [${job.id}] for reminder ${reminderId}`);

  const reminder = await Reminder.findById(reminderId);
  if (!reminder) {
    console.log(`[ReminderWorker] Reminder ${reminderId} not found, skipping`);
    return;
  }

  if (reminder.status === 'cancelled' || reminder.status === 'sent') {
    console.log(`[ReminderWorker] Reminder ${reminderId} is ${reminder.status}, skipping`);
    return;
  }

  reminder.status = 'processing';
  await reminder.save();

  try {
    const recipients = await resolveRecipients(reminder);
    if (recipients.length === 0) {
      console.log(`[ReminderWorker] No recipients for reminder ${reminderId}`);
      reminder.status = 'sent';
      reminder.completed = true;
      reminder.completedAt = new Date();
      await reminder.save();
      return;
    }

    let transporter = null;
    try {
      const nodemailerMod = await import('nodemailer');
      transporter = nodemailerMod.default.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });
    } catch (_) {}

    const results = [];
    for (const recipient of recipients) {
      const result = await deliverToRecipient(recipient, reminder, transporter);
      results.push(result);

      await ReminderRecipient.findOneAndUpdate(
        { reminderId: reminder._id, userId: result.recipientId },
        {
          $set: {
            deliveryStatus: result.deliveryStatus,
            deliveryChannel: result.deliveryChannel,
            sentAt: result.sentAt,
            failureReason: result.failureReason,
            retryCount: 0,
          },
          $push: { attempts: { $each: result.attempts } },
        },
        { upsert: true }
      );
    }

    const allFailed = results.every(r => r.deliveryStatus === 'failed');
    const anyDelivered = results.some(r => r.deliveryStatus === 'delivered');

    reminder.status = allFailed ? 'failed' : 'sent';
    if (anyDelivered) {
      reminder.completed = true;
      reminder.completedAt = new Date();
    }
    await reminder.save();

    console.log(`[ReminderWorker] Delivered reminder ${reminderId} to ${results.length} recipients (${allFailed ? 'all failed' : 'ok'})`);
  } catch (error) {
    console.error(`[ReminderWorker] Error processing reminder ${reminderId}:`, error.message);
    reminder.status = 'failed';
    await reminder.save();
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5,
});

reminderWorker.on('completed', (job) => {
  console.log(` Reminder job [${job.id}] completed`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(` Reminder job [${job.id}] failed:`, err.message);
});

console.log(' BullMQ: Reminder Worker Started');
