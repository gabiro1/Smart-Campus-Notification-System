import Event from '../model/Event.js';
import User from '../../user/model/User.js';
import { transitionEventStatus, canReview, canOverride, isValidTransition } from '../services/eventWorkflowService.js';
import { detectConflicts } from '../services/conflictDetectionService.js';
import { getEventAuditTrail, getReviewAnalytics } from '../services/auditService.js';
import { broadcastPublishedEvent } from '../services/eventWorkflowService.js';

export const getReviewQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, category, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    if (status) {
      if (Array.isArray(status)) query.status = { $in: status };
      else query.status = status;
    } else {
      query.status = { $in: ['PENDING_REVIEW', 'UNDER_REVIEW', 'NEEDS_REVISION'] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizerName: { $regex: search, $options: 'i' } },
        { departmentClub: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;

    const sortOption = {};
    if (sort.startsWith('-')) sortOption[sort.slice(1)] = -1;
    else sortOption[sort] = 1;

    const events = await Event.find(query)
      .populate('createdBy', 'name email role department profilePicture')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    const eventsWithConflicts = await Promise.all(
      events.map(async (event) => {
        const conflicts = await detectConflicts(event, event._id);
        return { ...event._doc, conflicts };
      })
    );

    res.json({
      success: true,
      events: eventsWithConflicts,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: Number(page) }
    });
  } catch (error) {
    console.error('Get Review Queue Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviewQueueByStatus = async (req, res) => {
  try {
    const statusGroups = await Event.aggregate([
      {
        $match: {
          status: { $in: ['PENDING_REVIEW', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED', 'SCHEDULED', 'PUBLISHED'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          oldest: { $min: '$createdAt' },
          newest: { $max: '$createdAt' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, statusGroups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!canReview(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review events' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (!['PENDING_REVIEW', 'UNDER_REVIEW', 'NEEDS_REVISION'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve event in ${event.status} status`
      });
    }

    const updated = await transitionEventStatus(
      id, 'APPROVED', req.user.id,
      { comment: comment || 'Approved by Guild Council', metadata: { reviewType: 'approve' } }
    );

    res.json({
      success: true,
      message: 'Event approved. It can now be scheduled or published.',
      event: updated
    });
  } catch (error) {
    console.error('Approve Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    if (!canReview(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await transitionEventStatus(
      id, 'REJECTED', req.user.id,
      { comment: reason, reason, metadata: { reviewType: 'reject' } }
    );

    res.json({ success: true, message: 'Event rejected', event: updated });
  } catch (error) {
    console.error('Reject Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: 'Revision notes are required' });
    }
    if (!canReview(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await transitionEventStatus(
      id, 'NEEDS_REVISION', req.user.id,
      { comment, metadata: { reviewType: 'revision_request' } }
    );

    res.json({ success: true, message: 'Revision requested', event: updated });
  } catch (error) {
    console.error('Request Revision Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!canReview(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to publish events' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (!['APPROVED', 'SCHEDULED'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot publish event in ${event.status} status. Must be APPROVED or SCHEDULED.`
      });
    }

    const updated = await transitionEventStatus(
      id, 'PUBLISHED', req.user.id,
      { comment: comment || 'Published by Guild Council' }
    );

    await broadcastPublishedEvent(updated);

    res.json({ success: true, message: 'Event published and broadcasted', event: updated });
  } catch (error) {
    console.error('Publish Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, comment } = req.body;

    if (!canReview(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Event must be APPROVED before scheduling' });
    }

    const updated = await transitionEventStatus(
      id, 'SCHEDULED', req.user.id,
      { comment: comment || `Scheduled for ${scheduledDate || event.startDate}`, metadata: { scheduledDate } }
    );

    res.json({ success: true, message: 'Event scheduled', event: updated });
  } catch (error) {
    console.error('Schedule Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const escalateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.user.role !== 'guild_president') {
      return res.status(403).json({ success: false, message: 'Only Guild Council can escalate to Principal' });
    }

    const updated = await transitionEventStatus(
      id, 'UNDER_REVIEW', req.user.id,
      { comment: comment || 'Escalated to Principal', metadata: { escalated: true, escalatedBy: req.user.id } }
    );

    res.json({ success: true, message: 'Event escalated to Principal', event: updated });
  } catch (error) {
    console.error('Escalate Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const overrideDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, reason } = req.body;
    const { canOverride: checkOverride } = await import('../services/eventWorkflowService.js');

    if (!checkOverride(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Principal and Admin can override decisions' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (!isValidTransition(event.status, newStatus)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${event.status} to ${newStatus}` });
    }

    const updated = await transitionEventStatus(
      id, newStatus, req.user.id,
      { reason: reason || 'Override by Principal', metadata: { overridden: true, overriddenBy: req.user.id, previousStatus: event.status } }
    );

    if (newStatus === 'PUBLISHED') {
      await broadcastPublishedEvent(updated);
    }

    res.json({ success: true, message: `Decision overridden. Event is now ${newStatus}`, event: updated });
  } catch (error) {
    console.error('Override Decision Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventAudit = async (req, res) => {
  try {
    const audit = await getEventAuditTrail(req.params.id);
    res.json({ success: true, ...audit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await getReviewAnalytics(req.query);

    const totalEvents = await Event.countDocuments();
    const publishedCount = await Event.countDocuments({ status: 'PUBLISHED' });
    const pendingCount = await Event.countDocuments({ status: { $in: ['PENDING_REVIEW', 'UNDER_REVIEW'] } });
    const approvedCount = await Event.countDocuments({ status: 'APPROVED' });
    const rejectedCount = await Event.countDocuments({ status: 'REJECTED' });
    const draftCount = await Event.countDocuments({ status: 'DRAFT' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEvents = await Event.countDocuments({
      status: 'PUBLISHED',
      startDate: { $gte: today, $lte: new Date(today.getTime() + 86400000) }
    });

    const categoryDistribution = await Event.aggregate([
      { $match: { status: { $in: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalEvents,
        publishedCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        draftCount,
        todayEvents,
        categoryDistribution,
        reviewAnalytics: analytics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCreatorEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    let query = { createdBy: req.user.id };
    if (status) query.status = status;

    const events = await Event.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    const statusCounts = await Event.aggregate([
      { $match: { createdBy: req.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      events,
      statusCounts,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: Number(page) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
