/**
 * copilot.controller.js
 * Academic Copilot — RAG-powered assistant for students
 * Returns structured, user-friendly notifications.
 */

import { chat } from '../../services/aiProvider.js';
import NotificationLog from '../notification/models/NotificationLog.js';

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
        status: 'unread',
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      notifications = recentNotifs.map((n) => ({
        type: n.type?.toUpperCase() || 'NOTICE',
        title: n.title,
        content: n.message,
      }));
    } catch (err) {
      console.warn('[Copilot] Could not fetch notifications:', err.message);
    }

    if (notifications.length === 0) {
      notifications.push({
        type: 'INFO',
        title: 'No recent notifications',
        content: 'You have no unread notifications at the moment.',
      });
    }

    // ─────────────────────────────
    // STEP 2: BUILD SYSTEM PROMPT
    // ─────────────────────────────
    const notificationText = notifications
      .map((n) => `- [${n.type}] ${n.title}: ${n.content}`)
      .join('\n');

    const systemPrompt = `You are "UniNotify AI", the official academic copilot for a smart campus system.
Use the context below to answer the student's query.

STUDENT:
Name: ${user.name}
Role: ${user.role}

RECENT NOTIFICATIONS:
${notificationText}

INSTRUCTIONS:
1. Be friendly, professional, and concise.
2. Address the student by their first name.
3. Use the notifications as the only source for answers.
4. Format the reply for readability: greeting, summary of notifications, next steps.
5. If the query cannot be answered from the context, politely say you don't know and suggest checking the notice board or contacting the department.
6. Keep your response under 5 sentences.`;


    // ─────────────────────────────
    // STEP 3: CALL AI PROVIDER
    // ─────────────────────────────
    let aiReply;
    try {
      aiReply = await chat({
        systemPrompt,
        userMessage: query.trim(),
        tier: 'CAPABLE',
        maxTokens: 400,
        temperature: 0.4,
      });
    } catch (err) {
      console.error('[Copilot] AI error:', err.message);
      aiReply = "I apologize, my AI assistant is currently unavailable. Please try again later.";
    }

    // ─────────────────────────────
    // STEP 4: STRUCTURE RESPONSE
    // ─────────────────────────────
    // We return the AI reply directly as a string for the message bubble,
    // and include metadata for any advanced UI features.
    const responsePayload = {
      success: true,
      reply: aiReply, 
      metadata: {
        greeting: "Hello!",
        systemMessage: "Here are your latest updates:",
        notifications,
        nextSteps: "Let me know if you want more details!"
      }
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