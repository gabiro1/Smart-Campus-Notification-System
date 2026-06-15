/**
 * copilot.controller.js
 * Academic Copilot — RAG-powered assistant for students
 * Returns structured, user-friendly responses with announcement search.
 */

import { chat } from '../../services/aiProvider.js';
import NotificationLog from '../notification/models/NotificationLog.js';
import Announcement from '../announcement/model/Announcement.js';
import Event from '../event/model/Event.js';

/**
 * POST /api/copilot
 * Body: { query: string }
 * User info: req.user (from auth middleware) OR req.body.userId (for testing)
 */
export const askCopilot = async (req, res) => {
  try {
    const { query, userId: fallbackUserId } = req.body;
    const user = req.user || (fallbackUserId ? { _id: fallbackUserId, name: 'Test Student', role: 'student' } : null);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user data missing. Please login or provide userId.',
      });
    }

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required.',
      });
    }

    // ─────────────────────────────
    // STEP 1: FETCH RECENT NOTIFICATIONS
    // ─────────────────────────────
    let notifications = [];
    try {
      const recentNotifs = await NotificationLog.find({
        studentId: user._id,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      notifications = recentNotifs.map((n) => ({
        type: n.type?.toUpperCase() || 'NOTICE',
        title: n.title,
        content: n.message,
        date: n.createdAt,
      }));
    } catch (err) {
      console.warn('[Copilot] Could not fetch notifications:', err.message);
    }

    // ─────────────────────────────
    // STEP 2: SEARCH ANNOUNCEMENTS & EVENTS (RAG)
    // ─────────────────────────────
    let relevantAnnouncements = [];
    let relevantEvents = [];

    try {
      // Use text search on announcements if query has relevant keywords
      const searchTerms = query
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .join(' ');

      if (searchTerms.length > 0) {
        // Find active announcements matching the query
        const matched = await Announcement.find(
          { $text: { $search: searchTerms }, status: 'Active' },
          { score: { $meta: 'textScore' } }
        )
          .populate('course', 'name code')
          .sort({ score: { $meta: 'textScore' } })
          .limit(3)
          .lean();

        relevantAnnouncements = matched.map((a) => ({
          title: a.title,
          content: a.content.substring(0, 300),
          course: a.course?.name || 'General',
          date: a.createdAt,
        }));

        // Also search events
        const matchedEvents = await Event.find(
          { $text: { $search: searchTerms }, status: 'PUBLISHED' },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(2)
          .lean();

        relevantEvents = matchedEvents.map((e) => ({
          title: e.title,
          description: e.description?.substring(0, 300) || '',
          date: e.startDate,
          venue: e.venue,
        }));
      }
    } catch (err) {
      console.warn('[Copilot] Could not search announcements:', err.message);
    }

    // If no unread notifications, show empty state
    if (notifications.length === 0) {
      notifications.push({
        type: 'INFO',
        title: 'No recent notifications',
        content: 'You have no unread notifications at the moment.',
        date: null,
      });
    }

    // ─────────────────────────────
    // STEP 3: BUILD SYSTEM PROMPT WITH RAG CONTEXT
    // ─────────────────────────────
    const notificationText = notifications
      .map((n) => `- [${n.type}] ${n.title}: ${n.content}`)
      .join('\n');

    const announcementText = relevantAnnouncements.length > 0
      ? '\nRELEVANT ANNOUNCEMENTS:\n' + relevantAnnouncements
          .map((a) => `- "${a.title}" (${a.course}): ${a.content.substring(0, 200)}`)
          .join('\n')
      : '';

    const eventText = relevantEvents.length > 0
      ? '\nRELEVANT EVENTS:\n' + relevantEvents
          .map((e) => `- "${e.title}" at ${e.venue || 'TBD'} on ${e.date ? new Date(e.date).toLocaleDateString() : 'TBD'}`)
          .join('\n')
      : '';

    const systemPrompt = `You are "UniNotify AI", the official academic copilot for a smart campus system.
Your job is to answer the student's question using the context provided below.

STUDENT:
Name: ${user.name}
Role: ${user.role}

RECENT NOTIFICATIONS:
${notificationText}${announcementText}${eventText}

INSTRUCTIONS:
1. Be friendly, professional, and concise.
2. Address the student by their first name.
3. Use the provided context (notifications, announcements, events) to answer the query.
4. If relevant announcement or event sources were found, reference them by title so the student knows where the info came from.
5. If the query cannot be answered from the context, politely say you don't know and suggest checking the notice board, asking their lecturer, or visiting the department office.
6. Keep your response under 5 sentences unless the question requires a detailed answer.`;

    // ─────────────────────────────
    // STEP 4: CALL AI PROVIDER
    // ─────────────────────────────
    let aiReply;
    try {
      aiReply = await chat({
        systemPrompt,
        userMessage: query.trim(),
        tier: 'CAPABLE',
        maxTokens: 500,
        temperature: 0.4,
      });
    } catch (err) {
      console.error('[Copilot] AI error:', err.message);
      aiReply = "I apologize, my AI assistant is currently unavailable. Please try again later.";
    }

    // ─────────────────────────────
    // STEP 5: STRUCTURE RESPONSE
    // ─────────────────────────────
    const responsePayload = {
      success: true,
      reply: aiReply,
      sources: {
        announcements: relevantAnnouncements.map((a) => ({
          title: a.title,
          course: a.course,
          date: a.date,
        })),
        events: relevantEvents.map((e) => ({
          title: e.title,
          date: e.date,
          venue: e.venue,
        })),
      },
    };

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error('[Copilot] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again later.',
    });
  }
};

export const askAnnouncementQuestion = async (req, res) => {
  try {
    const { question, announcementTitle, announcementContent, course } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: please login.',
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required.',
      });
    }

    const systemPrompt = `You are "UniNotify AI", the official academic assistant for a smart campus notification system.
You help students understand announcements from their lecturers.

ANNOUNCEMENT DETAILS:
Title: ${announcementTitle || 'N/A'}
Course: ${course || 'General'}
Content: ${announcementContent || 'N/A'}

INSTRUCTIONS:
1. Answer the student's question based ONLY on the announcement content provided above.
2. If the answer cannot be found in the announcement, politely say so and suggest checking other sources or contacting the lecturer.
3. Be helpful, clear, and concise. Keep response under 4 sentences.
4. Use a friendly, professional tone.
5. Do NOT make up information that is not in the announcement.`;

    let aiReply;
    try {
      aiReply = await chat({
        systemPrompt,
        userMessage: question.trim(),
        tier: 'FAST',
        maxTokens: 300,
        temperature: 0.4,
      });
    } catch (err) {
      console.error('[Copilot] AI error:', err.message);
      aiReply = "I'm currently unavailable. Please check the notice board or contact your lecturer for more details.";
    }

    return res.status(200).json({
      success: true,
      reply: aiReply,
    });

  } catch (error) {
    console.error('[Copilot] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again later.',
    });
  }
};