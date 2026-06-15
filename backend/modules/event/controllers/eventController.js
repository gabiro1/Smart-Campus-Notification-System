import Event from '../model/Event.js';
import EventRSVP from '../model/EventRSVP.js';
import Bookmark from '../model/Bookmark.js';
import EventAttachment from '../model/EventAttachment.js';
import User from '../../user/model/User.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import { getTargetedUsers } from '../../../utils/notificationEngine.js';
import { calculateMatchScore } from '../../../utils/mlEngine.js';
import { classifyWithFallback } from '../../../services/aiClassificationService.js';
import { scheduleEventReminders, cancelEventReminders } from '../../../services/eventReminderScheduler.js';
import { getPersonalizedContentBatch } from '../../../services/aiPersonalizationService.js';
import { shouldSendNow } from '../../../utils/quietHours.js';
import { sendSMSViaTwilio } from '../../../services/smsService.js';
import { sendMulticastNotification } from '../../../config/firebaseAdmin.js';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import ics from 'ics';

import {
  transitionEventStatus,
  submitForReview,
  publishEventDirectly,
  canCreateDirectly,
  canReview,
  canOverride,
  isValidTransition,
  broadcastPublishedEvent
} from '../services/eventWorkflowService.js';
import { detectConflicts } from '../services/conflictDetectionService.js';
import { getEventAuditTrail, getReviewAnalytics } from '../services/auditService.js';

/* =========================================================
   CREATE DRAFT
========================================================= */
export const createDraft = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user.id, status: 'DRAFT' };

    let aiMetadata = null;
    try {
      const classification = await classifyWithFallback({
        title: eventData.title,
        content: eventData.description || '',
        senderRole: req.user.role
      });
      eventData.priority = classification.priority;
      eventData.tags = classification.tags;
      aiMetadata = {
        usedAI: classification.usedAI,
        fallbackReason: classification.fallbackReason || null,
        aiCategory: classification.aiCategory || null,
        aiUrgency: classification.aiUrgency || null,
        classifiedAt: new Date()
      };
    } catch (classificationErr) {
      eventData.priority = 'medium';
      eventData.tags = ['general'];
      aiMetadata = {
        usedAI: false,
        fallbackReason: classificationErr.message,
        aiCategory: null,
        aiUrgency: null,
        classifiedAt: new Date()
      };
    }
    eventData.aiMetadata = aiMetadata;

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event draft created',
      event
    });
  } catch (error) {
    console.error('Create Draft Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   UPDATE DRAFT
========================================================= */
export const updateDraft = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }
    if (['CANCELLED', 'EXPIRED', 'REJECTED'].includes(event.status)) {
      return res.status(400).json({ success: false, message: 'Cannot edit a cancelled, expired or rejected event' });
    }

    Object.assign(event, req.body);
    event.updatedBy = req.user.id;
    await event.save();

    res.json({ success: true, message: 'Draft updated', event });
  } catch (error) {
    console.error('Update Draft Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   SUBMIT FOR REVIEW
========================================================= */
export const submitEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (canCreateDirectly(req.user.role)) {
      const updated = await transitionEventStatus(req.params.id, 'PUBLISHED', req.user.id, {
        reason: 'Auto-approved and published (authorized role)'
      });
      try { await broadcastPublishedEvent(updated); } catch (e) {}
      return res.status(200).json({
        success: true,
        message: 'Event published directly (auto-approved role)',
        event: updated,
        autoApproved: true
      });
    }

    const conflicts = await detectConflicts(event, event._id);
    if (conflicts.length > 0) {
      event.set('detectedConflicts', conflicts);
    }

    const updated = await submitForReview(event._id, req.user.id);

    res.json({
      success: true,
      message: 'Event submitted for Guild Council review',
      event: updated,
      conflicts: conflicts.length > 0 ? conflicts : undefined
    });
  } catch (error) {
    console.error('Submit Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   CREATE & PUBLISH (Direct publish for authorized roles)
========================================================= */
export const createAndPublish = async (req, res) => {
  try {
    if (!canCreateDirectly(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only Guild Council, Principal, and Admin can publish directly'
      });
    }

    const eventData = { ...req.body };

    let aiMetadata = null;
    try {
      const classification = await classifyWithFallback({
        title: eventData.title,
        content: eventData.description || '',
        senderRole: req.user.role
      });
      eventData.priority = classification.priority;
      eventData.tags = classification.tags;
      aiMetadata = {
        usedAI: classification.usedAI,
        fallbackReason: classification.fallbackReason || null,
        aiCategory: classification.aiCategory || null,
        aiUrgency: classification.aiUrgency || null,
        classifiedAt: new Date()
      };
    } catch (classificationErr) {
      eventData.priority = 'medium';
      eventData.tags = ['general'];
      aiMetadata = {
        usedAI: false,
        fallbackReason: classificationErr.message,
        aiCategory: null,
        aiUrgency: null,
        classifiedAt: new Date()
      };
    }
    eventData.aiMetadata = aiMetadata;

    const event = await publishEventDirectly(eventData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Event published successfully',
      event
    });
  } catch (error) {
    console.error('Create & Publish Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   GET STUDENT FEED (published events, AI-ranked)
========================================================= */
export const getStudentFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const events = await Event.find({
      status: { $in: ['PUBLISHED', 'APPROVED', 'SCHEDULED'] }
    }).populate('createdBy', 'name email role').sort({ createdAt: -1 });

    const userBookmarks = await Bookmark.find({ userId: req.user.id }).select('eventId').lean();
    const bookmarkedIds = new Set(userBookmarks.map(b => b.eventId.toString()));

    const rankedFeed = events
      .map(event => {
        const avgRating = event.ratings?.length > 0
          ? parseFloat((event.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / event.ratings.length).toFixed(1))
          : 0;
        return {
          ...event._doc,
          aiMatchScore: calculateMatchScore(user, event),
          isBookmarked: bookmarkedIds.has(event._id.toString()),
          avgRating,
          ratingCount: event.ratings?.length || 0
        };
      })
      .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    res.json({ success: true, events: rankedFeed, total: rankedFeed.length });
  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   GET EVENT DETAILS
========================================================= */
export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('publishedBy', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const attachments = await EventAttachment.find({ event: event._id }).sort({ createdAt: -1 });
    const auditTrail = await getEventAuditTrail(event._id);

    const avgRating = event.ratings?.length > 0
      ? parseFloat((event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      event: {
        ...event._doc,
        avgRating,
        ratingCount: event.ratings?.length || 0,
        attachments,
        auditTrail
      }
    });
  } catch (error) {
    console.error('Get Event Details Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   GET ALL EVENTS (paginated, filtered)
========================================================= */
export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category, venue, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (venue) query.venue = { $regex: venue, $options: 'i' };
    if (startDate) query.startDate = { $gte: new Date(startDate) };
    if (endDate) query.endDate = { $lte: new Date(endDate) };

    const events = await Event.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: Number(page) }
    });
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   SEARCH EVENTS
========================================================= */
export const searchEvents = async (req, res) => {
  try {
    const { q, tags } = req.query;
    let query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { venue: { $regex: q, $options: 'i' } }
      ];
    }
    if (tags) query.tags = { $in: typeof tags === 'string' ? [tags] : tags };
    const events = await Event.find(query).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   CANCEL EVENT
========================================================= */
export const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.createdBy.toString() !== req.user.id &&
        !canReview(req.user.role) &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['CANCELLED', 'EXPIRED'].includes(event.status)) {
      return res.status(400).json({ success: false, message: 'Event already ended' });
    }

    const updated = await transitionEventStatus(
      event._id, 'CANCELLED', req.user.id,
      { comment: req.body.reason || 'Cancelled by organizer' }
    );

    res.json({ success: true, message: 'Event cancelled', event: updated });
  } catch (error) {
    console.error('Cancel Event Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   DELETE EVENT
========================================================= */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    try {
      await cancelEventReminders(event._id);
    } catch (reminderErr) {
      console.warn('[deleteEvent] Failed to cancel reminders, continuing:', reminderErr);
    }

    await EventAttachment.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(event._id);

    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('[deleteEvent] Error deleting event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   GET EVENT STATS
========================================================= */
export const getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const rsvpCount = await EventRSVP.countDocuments({ eventId: event._id });
    const goingCount = await EventRSVP.countDocuments({ eventId: event._id, status: 'going' });
    const maybeCount = await EventRSVP.countDocuments({ eventId: event._id, status: 'maybe' });
    const attendedCount = await EventRSVP.countDocuments({ eventId: event._id, attended: true });

    const stats = {
      eventId: event._id,
      title: event.title,
      totalRSVP: rsvpCount,
      goingCount,
      maybeCount,
      attendedCount,
      totalRatings: event.ratings?.length || 0,
      avgRating: event.ratings?.length > 0
        ? parseFloat((event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1))
        : 0
    };

    if (req.query.attended === 'true') {
      const attendees = await EventRSVP.find({ eventId: event._id, attended: true })
        .populate('userId', 'name email role department profilePicture')
        .lean();
      stats.attendees = attendees.map(a => ({
        _id: a._id,
        name: a.userId?.name,
        email: a.userId?.email,
        role: a.userId?.role,
        department: a.userId?.department?.name || a.userId?.department,
        profilePicture: a.userId?.profilePicture,
        attendedAt: a.attendedAt || a.updatedAt
      }));
    }

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   PARSE FLYER (OCR + AI)
========================================================= */
export const parseFlyer = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const imagePath = req.file.path;
    const posterUrl = `/uploads/posters/${req.file.filename}`;

    const { data: { text: extractedText } } = await Tesseract.recognize(imagePath, 'eng');

    if (!extractedText?.trim()) {
      return res.status(422).json({ success: true, posterUrl, parsedData: {}, message: 'No text extracted' });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    let aiResponse = null;
    const prompt = `Extract structured event info from OCR text. Return JSON with: title, description, date (YYYY-MM-DD), startTime (HH:MM), endTime (HH:MM), venue, category (academic/cultural/sports/social/workshop/seminar/meeting/ceremony/competition/fundraiser/orientation/other), tags. OCR: ${extractedText}`;

    if (groqKey) {
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama-3.2-90b-vision-preview', messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 1024 })
        });
        const data = await resp.json();
        if (data.choices?.[0]) aiResponse = data.choices[0].message.content;
      } catch (e) { console.error('GROQ failed:', e.message); }
    }

    if (!aiResponse && openrouterKey) {
      try {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openrouterKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:8000', 'X-Title': 'UniNotify' },
          body: JSON.stringify({ model: 'google/gemini-2.0-flash-exp:free', messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 1024 })
        });
        const data = await resp.json();
        if (data.choices?.[0]) aiResponse = data.choices[0].message.content;
      } catch (e) { console.error('OpenRouter failed:', e.message); }
    }

    let parsedData = {};
    if (aiResponse) {
      try {
        parsedData = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        console.error('AI parse error:', aiResponse);
      }
    }

    res.json({ success: true, posterUrl, parsedData });
  } catch (error) {
    console.error('Parse Flyer Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   CALENDAR EXPORT
========================================================= */
export const exportCalendar = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    let organizer = 'University Event';
    if (event.createdBy) {
      const creator = await User.findById(event.createdBy).select('name email');
      if (creator) organizer = `${creator.name} <${creator.email}>`;
    }

    const startDate = new Date(event.startDate || event.date);
    if (event.startTime) {
      const parts = event.startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (parts) {
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        if (parts[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
        if (parts[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
        startDate.setHours(h, m, 0, 0);
      }
    }

    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate);
    if (event.endTime) {
      const parts = event.endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (parts) {
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        if (parts[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
        if (parts[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
        endDate.setHours(h, m, 0, 0);
      }
    } else {
      endDate.setHours(endDate.getHours() + 1);
    }

    const icsEvent = {
      start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
      end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
      title: event.title,
      description: `${event.description || ''}\n\nVenue: ${event.venue || event.location || ''}\nOrganizer: ${event.organizerName || ''}`,
      location: event.venue || event.location || '',
      organizer: { name: organizer },
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      categories: [event.category || 'University Event'],
      priority: 5
    };

    const { error, value } = ics.createEvent(icsEvent);
    if (error) return res.status(500).json({ success: false, message: 'Failed to generate calendar file' });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event._id}.ics"`);
    res.send(value);
  } catch (error) {
    console.error('Calendar Export Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   BOOKMARK METHODS
========================================================= */
export const toggleBookmark = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const existing = await Bookmark.findOne({ userId, eventId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ success: true, isBookmarked: false, message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ userId, eventId });
      return res.json({ success: true, isBookmarked: true, message: 'Event bookmarked' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookmarkedEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const total = await Bookmark.countDocuments({ userId: req.user.id });
    const bookmarks = await Bookmark.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('eventId');

    const validEvents = bookmarks
      .filter(b => b.eventId)
      .map(b => ({ ...b.eventId._doc, isBookmarked: true }));

    res.json({
      success: true,
      events: validEvents,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: Number(page) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   INTEREST & RATING
========================================================= */
export const interestInEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!user.interestWeights) user.interestWeights = new Map();
    event.tags?.forEach(tag => {
      user.interestWeights.set(tag, (user.interestWeights.get(tag) || 0) + 1.5);
    });
    await user.save();
    res.json({ message: 'Interest recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rateEvent = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userIdStr = req.user.id.toString();
    const existingIdx = event.ratings?.findIndex(r => r.studentId?.toString() === userIdStr) ?? -1;

    if (existingIdx !== -1) {
      event.ratings[existingIdx].rating = rating;
      event.markModified('ratings');
    } else {
      event.ratings.push({ studentId: req.user.id, rating });
    }
    await event.save();

    const user = await User.findById(req.user.id);
    if (user && event.tags) {
      const adjustment = rating >= 4 ? 2 : rating <= 2 ? -2 : 0;
      if (adjustment !== 0) {
        const weights = user.interestWeights?.toJSON() || {};
        event.tags.forEach(tag => { weights[tag] = Math.max(0, (weights[tag] || 0) + adjustment); });
        user.interestWeights = weights;
        await user.save();
      }
    }

    const avgRating = event.ratings?.length > 0
      ? parseFloat((event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      message: existingIdx !== -1 ? 'Rating updated' : 'Rating submitted',
      avgRating,
      ratingCount: event.ratings?.length || 0,
      userRating: rating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   STUDENT CHECK-IN
========================================================= */
export const studentCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentIdentifier } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.checkedInBy?.some(c => c.studentId?.toString() === userId.toString())) {
      return res.status(400).json({ success: false, message: 'Already checked in' });
    }

    event.checkedInBy.push({ studentId: userId, studentIdentifier: studentIdentifier || studentId, checkedInAt: new Date() });
    await event.save();

    const user = await User.findById(userId);
    if (user) {
      const totalAttended = await Event.countDocuments({ 'checkedInBy.studentId': userId });
      user.attendanceRate = Math.min(100, totalAttended * 5);
      await user.save();
    }

    res.json({ success: true, message: 'Check-in successful', checkedInAt: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Check-in failed', error: error.message });
  }
};

/* =========================================================
   AVAILABLE TAGS (from published events)
========================================================= */
export const getAvailableTags = async (req, res) => {
  try {
    const tags = await Event.aggregate([
      { $match: { status: { $in: ['published', 'approved'] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const result = tags
      .filter((t) => t._id && t._id.trim())
      .map((t) => ({ name: t._id, count: t.count }));

    res.json({ success: true, tags: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tags', error: error.message });
  }
};
