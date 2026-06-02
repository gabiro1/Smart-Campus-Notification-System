import Event from '../model/Event.js';
import EventReview from '../model/EventReview.js';
import EventStatusHistory from '../model/EventStatusHistory.js';
import EventNotification from '../model/EventNotification.js';
import User from '../../user/model/User.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import { getTargetedUsers } from '../../../utils/notificationEngine.js';
import { sendMulticastNotification } from '../../../config/firebaseAdmin.js';
import { scheduleEventReminders, cancelEventReminders } from '../../../services/eventReminderScheduler.js';

const VALID_TRANSITIONS = {
  DRAFT: ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'NEEDS_REVISION', 'CANCELLED'],
  NEEDS_REVISION: ['PENDING_REVIEW', 'CANCELLED'],
  APPROVED: ['SCHEDULED', 'PUBLISHED', 'CANCELLED', 'REJECTED'],
  SCHEDULED: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['CANCELLED', 'EXPIRED'],
  CANCELLED: [],
  EXPIRED: []
};

const AUTOMATED_ROLES = ['guild_president', 'principal', 'admin'];

const ROLE_PUBLISH_ALLOWED = ['guild_president', 'principal', 'admin'];
const ROLE_REVIEW_ALLOWED = ['guild_president', 'principal', 'admin'];
const ROLE_OVERRIDE_ALLOWED = ['principal', 'admin'];

export function isValidTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

export function canCreateDirectly(role) {
  return ROLE_PUBLISH_ALLOWED.includes(role);
}

export function canReview(role) {
  return ROLE_REVIEW_ALLOWED.includes(role);
}

export function canOverride(role) {
  return ROLE_OVERRIDE_ALLOWED.includes(role);
}

export async function transitionEventStatus(eventId, newStatus, userId, { comment, reason, metadata } = {}) {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oldStatus = event.status;
  if (!isValidTransition(oldStatus, newStatus)) {
    throw new Error(`Cannot transition from ${oldStatus} to ${newStatus}`);
  }

  event.status = newStatus;
  event.updatedBy = userId;

  if (newStatus === 'REJECTED') {
    event.rejectionReason = reason || comment || '';
  }
  if (newStatus === 'NEEDS_REVISION') {
    event.revisionNotes = comment || '';
  }
  if (newStatus === 'PUBLISHED') {
    event.publishedBy = userId;
  }
  if (newStatus === 'CANCELLED') {
    event.cancelledBy = userId;
  }

  await event.save();

  await EventStatusHistory.create({
    event: eventId,
    fromStatus: oldStatus,
    toStatus: newStatus,
    changedBy: userId,
    changedByRole: user.role,
    reason: reason || comment || '',
    metadata: metadata || {}
  });

  await EventReview.create({
    event: eventId,
    reviewer: userId,
    action: mapStatusToAction(newStatus),
    comment: comment || '',
    previousStatus: oldStatus,
    newStatus,
    metadata: metadata || {}
  });

  if (newStatus === 'APPROVED') {
    try {
      await scheduleEventReminders(eventId);
    } catch (err) {
      console.error('[Workflow] Reminder scheduling failed:', err.message);
    }
  }

  if (oldStatus === 'APPROVED' && newStatus !== 'PUBLISHED' && newStatus !== 'APPROVED') {
    try {
      await cancelEventReminders(eventId);
    } catch (err) {
      console.error('[Workflow] Reminder cancellation failed:', err.message);
    }
  }

  return event;
}

export async function publishEventDirectly(eventData, userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (!canCreateDirectly(user.role)) {
    throw new Error('Your role does not have permission to publish events directly');
  }

  const event = await Event.create({
    ...eventData,
    createdBy: userId,
    publishedBy: userId,
    status: 'PUBLISHED',
    approvedBy: userId
  });

  await EventStatusHistory.create({
    event: event._id,
    fromStatus: 'DRAFT',
    toStatus: 'PUBLISHED',
    changedBy: userId,
    changedByRole: user.role,
    reason: 'Direct publishing by authorized role'
  });

  await EventReview.create({
    event: event._id,
    reviewer: userId,
    action: 'PUBLISHED',
    previousStatus: 'DRAFT',
    newStatus: 'PUBLISHED',
    metadata: { directPublish: true }
  });

  await broadcastPublishedEvent(event);

  return event;
}

export async function submitForReview(eventId, userId) {
  return transitionEventStatus(eventId, 'PENDING_REVIEW', userId, { reason: 'Submitted for review' });
}

async function broadcastPublishedEvent(event) {
  try {
    const recipients = await getTargetedUsers(event);

    if (!recipients || recipients.length === 0) {
      console.log('[Broadcast] No recipients for event', event._id);
      return;
    }

    const title = `New Event: ${event.title}`;
    const message = event.venue
      ? `${event.venue} | ${new Date(event.startDate).toLocaleDateString()} at ${event.startTime}`
      : event.description;

    const notificationDocs = recipients.map(student => ({
      referenceId: event._id,
      studentId: student._id,
      recipientId: student._id,
      title,
      message,
      type: 'event',
      status: 'unread',
      priority: event.priority || 'medium'
    }));

    await NotificationLog.insertMany(notificationDocs);

    const validRecipients = recipients.filter(u => u.fcmToken && u.fcmToken.trim());
    if (validRecipients.length > 0) {
      const tokens = validRecipients.map(u => u.fcmToken);
      try {
        await sendMulticastNotification(tokens, { title, body: message });
      } catch (err) {
        console.error('[Broadcast] Push failed:', err.message);
      }
    }

    console.log(`[Broadcast] Event ${event._id} broadcasted to ${recipients.length} users`);
  } catch (err) {
    console.error('[Broadcast] Error:', err.message);
  }
}

function mapStatusToAction(status) {
  const map = {
    'PENDING_REVIEW': 'SUBMITTED',
    'UNDER_REVIEW': 'SUBMITTED',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
    'NEEDS_REVISION': 'REVISION_REQUESTED',
    'PUBLISHED': 'PUBLISHED',
    'CANCELLED': 'CANCELLED',
    'SCHEDULED': 'PUBLISHED',
    'EXPIRED': 'CANCELLED'
  };
  return map[status] || 'SUBMITTED';
}

export { broadcastPublishedEvent };
