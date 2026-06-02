import EventReview from '../model/EventReview.js';
import EventStatusHistory from '../model/EventStatusHistory.js';
import Event from '../model/Event.js';

export async function getEventAuditTrail(eventId) {
  const [reviews, statusHistory, event] = await Promise.all([
    EventReview.find({ event: eventId })
      .populate('reviewer', 'name email role')
      .sort({ createdAt: -1 }),
    EventStatusHistory.find({ event: eventId })
      .populate('changedBy', 'name email role')
      .sort({ createdAt: -1 }),
    Event.findById(eventId)
      .populate('createdBy', 'name email role')
      .populate('publishedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('cancelledBy', 'name email role')
  ]);

  return {
    event: event ? {
      id: event._id,
      title: event.title,
      status: event.status,
      createdBy: event.createdBy,
      publishedBy: event.publishedBy,
      approvedBy: event.approvedBy,
      cancelledBy: event.cancelledBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    } : null,
    reviews,
    statusHistory,
    timeline: buildTimeline(statusHistory, reviews)
  };
}

function buildTimeline(statusHistory, reviews) {
  const events = [];

  statusHistory.forEach(h => {
    events.push({
      type: 'STATUS_CHANGE',
      date: h.createdAt,
      user: h.changedBy,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason,
      role: h.changedByRole
    });
  });

  reviews.forEach(r => {
    events.push({
      type: 'REVIEW',
      date: r.createdAt,
      user: r.reviewer,
      action: r.action,
      comment: r.comment
    });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events;
}

export async function getReviewAnalytics({ startDate, endDate } = {}) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const analytics = await EventReview.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusDistribution = await Event.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const averageReviewTime = await EventReview.aggregate([
    {
      $match: {
        action: { $in: ['APPROVED', 'REJECTED', 'REVISION_REQUESTED'] },
        ...matchStage
      }
    },
    {
      $group: {
        _id: null,
        avgTimeHours: { $avg: { $divide: [{ $subtract: ['$createdAt', '$updatedAt'] }, 3600000] } },
        totalReviewed: { $sum: 1 }
      }
    }
  ]);

  return {
    actionBreakdown: analytics,
    statusDistribution,
    averageReviewTime: averageReviewTime[0] || { avgTimeHours: 0, totalReviewed: 0 }
  };
}
