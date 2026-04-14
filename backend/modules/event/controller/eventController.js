import Event from "../model/Event.js";
import EventRSVP from "../model/EventRSVP.js";
import Bookmark from "../model/Bookmark.js";
import User from "../../user/model/User.js";
import NotificationLog from "../../notification/models/NotificationLog.js";
import { getTargetedUsers } from "../../../utils/notificationEngine.js";
import { sendPushNotification } from "../../../config/firebaseAdmin.js";
import { calculateMatchScore } from "../../../utils/mlEngine.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { sendMulticastNotification } from "../../../config/firebaseAdmin.js";
import ics from 'ics';
import { classifyWithFallback } from "../../../services/aiClassificationService.js";
import { scheduleEventReminders, cancelEventReminders, updateEventReminders } from "../../../services/eventReminderScheduler.js";
import { getPersonalizedContentBatch } from "../../../services/aiPersonalizationService.js";
import { shouldSendNow } from "../../../utils/quietHours.js";

/* =========================================================
    AI FLYER PARSING (using OpenRouter - tries GROQ first, then fallback)
========================================================= */
export const parseFlyer = async (req, res) => {
  try {

    /* -------------------------------
       1️⃣ Validate API Keys
    -------------------------------- */
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!groqKey && !openrouterKey) {
      console.error("No AI API key configured in .env");
      return res.status(500).json({
        message: "Server AI configuration error"
      });
    }

    /* -------------------------------
       2️⃣ Validate Image Upload
    -------------------------------- */
    if (!req.file) {
      return res.status(400).json({
        message: "No image file uploaded"
      });
    }

    const imagePath = req.file.path;
    const posterUrl = `/uploads/posters/${req.file.filename}`;

    /* -------------------------------
       3️⃣ OCR: Extract Text From Image
    -------------------------------- */
    const {
      data: { text: extractedText }
    } = await Tesseract.recognize(imagePath, "eng");

    if (!extractedText || !extractedText.trim()) {
      return res.status(422).json({
        message: "Could not extract readable text from image",
        posterUrl
      });
    }

    /* -------------------------------
       4️⃣ Build AI Prompt
    -------------------------------- */
    const prompt = `
You are an AI that extracts structured event information from OCR text.

Return ONLY valid JSON with this exact structure:

{
  "title": "string - event name",
  "description": "string - event details",
  "date": "YYYY-MM-DD format",
  "time": "HH:MM format (24hr)",
  "location": "string - venue/room",
  "tags": ["array", "of", "relevant tags"]
}

OCR TEXT:
${extractedText}
`;

    /* -------------------------------
       5️⃣ Try GROQ first, then OpenRouter
    -------------------------------- */
    let aiResponse = null;
    let errorMsg = null;
    
    // Try GROQ
    if (groqKey) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.2-90b-vision-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 1024
          })
        });

        const groqData = await groqResponse.json();
        
        if (groqData.choices && groqData.choices[0]) {
          aiResponse = groqData.choices[0].message.content;
          console.log("Used GROQ AI for parsing");
        } else {
          errorMsg = "GROQ returned no response";
        }
      } catch (e) {
        errorMsg = e.message;
      }
    }
    
    // Try OpenRouter if GROQ failed
    if (!aiResponse && openrouterKey) {
      try {
        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:8000',
            'X-Title': 'UniNotify'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 1024
          })
        });

        const orData = await orResponse.json();
        
        if (orData.choices && orData.choices[0]) {
          aiResponse = orData.choices[0].message.content;
          console.log("Used OpenRouter AI for parsing");
        } else {
          errorMsg = orData.error?.message || "OpenRouter returned no response";
        }
      } catch (e) {
        errorMsg = e.message;
      }
    }

    if (!aiResponse) {
      throw new Error(errorMsg || "All AI providers failed");
    }

    /* -------------------------------
       6️⃣ Clean AI Response
    -------------------------------- */
    let parsedData = {};

    try {

      const cleanJson = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsedData = JSON.parse(cleanJson);

    } catch (parseError) {

      console.error("AI JSON Parse Error:", aiResponse);

      return res.status(200).json({
        success: true,
        posterUrl,
        parsedData: {},
        message: "Image uploaded but AI returned invalid JSON"
      });

    }

    /* -------------------------------
       7️⃣ Send Success Response
    -------------------------------- */
    res.status(200).json({
      success: true,
      posterUrl,
      parsedData
    });

  } catch (error) {

    console.error("Flyer Parsing Error:", error);

    res.status(500).json({
      message: "Failed to parse event flyer",
      error: error.message
    });

  }
};


/* =========================================================
   CREATE EVENT (WITH APPROVAL WORKFLOW)
========================================================= */
export const createEvent = async (req, res) => {
  try {
    // Spread the request body (already enriched by classRepPulseEventScope
    // middleware for class_rep users) and stamp the authenticated creator.
    const eventData = { ...req.body, createdBy: req.user.id };
    let status = "pending";
    let approvalLevel = req.body.approvalLevel || "none";

    // ── Role-based workflow routing ─────────────────────────────────────
    if (req.user.role === "admin" || eventData.isEmergency === true) {
      // Admins and emergency broadcasts bypass the approval queue entirely.
      status = "approved";

    } else if (req.user.role === "class_rep") {
      // CLASS REP PATH
      // ─────────────────────────────────────────────────────────────────
      // By this point the classRepPulseEventScope middleware has already:
      //   • Set req.body.targetScope      = 'class'
      //   • Set req.body.targetLevel      = rep's representedLevel  (e.g. 'Year 2')
      //   • Set req.body.targetDepartment = rep's representedDepartment (ObjectId)
      //
      // We trust those values here — no need to read them again from the user
      // object. We just enforce the correct approval chain.
      //
      // Class-level events are reviewed by the department before going live,
      // so they route through the 'department' approval level.
      approvalLevel = "department";
      // status remains 'pending' — HoD / department head will approve.

    } else if (req.user.role === "hod") {
      // HoD events require school-level sign-off.
      approvalLevel = "school";

    } else if (req.user.role === "lecturer") {
      // Lecturer events go to department for approval.
      approvalLevel = "department";
    }
    // Note: guild_president defaults to 'pending' with client-supplied
    // approvalLevel unless isEmergency is toggled.

    // ── AI CLASSIFICATION (with defensive fallback) ─────────────────────
    let aiMetadata = null;
    try {
      const classification = await classifyWithFallback({
        title: eventData.title,
        content: eventData.description || '',
        senderRole: req.user.role
      });

      // Apply AI/fallback results to event data
      eventData.priority = classification.priority;
      eventData.tags = classification.tags;

      // Store full classification metadata for auditing
      aiMetadata = {
        usedAI: classification.usedAI,
        fallbackReason: classification.fallbackReason || null,
        aiCategory: classification.aiCategory || null,
        aiUrgency: classification.aiUrgency || null,
        classifiedAt: new Date()
      };

      // Only set targetScope if not already determined by role-based routing
      if (!eventData.targetScope && classification.targetScope) {
        eventData.targetScope = classification.targetScope;
      }

      console.log(`[Event Creation] AI classification applied for event "${eventData.title.substring(0, 50)}...":`, {
        priority: classification.priority,
        tags: classification.tags,
        targetScope: eventData.targetScope,
        usedAI: classification.usedAI
      });

    } catch (classificationErr) {
      // This should NOT happen - classifyWithFallback should never throw
      console.error('[Event Creation] ❌ Classification error (should have been caught):', classificationErr.message);
      // Fallback to default values to ensure event creation proceeds
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

    const event = new Event({ ...eventData, status, approvalLevel, aiMetadata });
    await event.save();

    // If event is auto-approved, schedule reminder jobs and broadcast
    if (status === "approved") {
      // Schedule reminder notifications (24h and 1h before event)
      try {
        await scheduleEventReminders(event._id);
        console.log(`[EventCreation] Reminder jobs scheduled for event ${event._id}`);
      } catch (schedulerErr) {
        console.error(`[EventCreation] Failed to schedule reminders for event ${event._id}:`, schedulerErr.message);
        // Continue - don't fail the request if scheduling fails
      }

      await broadcastEvent(event);
    }

    res.status(201).json({
      success: true,
      message:
        status === "pending"
          ? "Event submitted for approval."
          : "Event broadcasted successfully.",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   STUDENT FEED (AI RANKING)
========================================================= */
export const getStudentFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const levelNumber = Number(user.level);
    
    // Build query conditions - match user's school, department, level, or events with no restrictions
    const orConditions = [
      { targetSchool: user.school?.toString() }, 
      { targetLevel: 0 },
      { targetLevel: null },
      { targetLevel: undefined }
    ];

    if (!isNaN(levelNumber) && levelNumber > 0) {
      orConditions.push({
        targetDept: user.department?.toString(),
        targetLevel: levelNumber,
      });
    }

    // Query for APPROVED events OR events with no target restrictions (public events)
    // Also include events created by the user themselves
    const events = await Event.find({
      $and: [
        {
          $or: [
            { status: "approved" },
            { createdBy: user._id } // User can see their own events even if pending
          ]
        },
        {
          $or: orConditions
        }
      ]
    }).populate('createdBy', 'name email');

    // If no events found with targeting, fetch all approved events as fallback
    let rankedFeed = events;
    if (rankedFeed.length === 0) {
      const fallbackEvents = await Event.find({ status: "approved" })
        .populate('createdBy', 'name email');
      
      rankedFeed = fallbackEvents;
    }

    // Fetch this user's bookmarked event IDs for annotation
    const userBookmarks = await Bookmark.find({ userId: req.user.id }).select('eventId').lean();
    const bookmarkedIds = new Set(userBookmarks.map(b => b.eventId.toString()));

    // Calculate AI match scores and sort
    rankedFeed = rankedFeed
      .map((event) => {
        // Calculate average rating
        const avgRating = event.ratings && event.ratings.length > 0
          ? parseFloat((event.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / event.ratings.length).toFixed(1))
          : 0;
        
        return {
          ...event._doc,
          aiMatchScore: calculateMatchScore(user, event),
          isBookmarked: bookmarkedIds.has(event._id.toString()),
          avgRating,
          ratingCount: event.ratings?.length || 0,
        };
      })
      .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    // Return in consistent format with events key
    res.json({ 
      success: true, 
      events: rankedFeed,
      total: rankedFeed.length
    });
  } catch (error) {
    console.error("Feed Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================
   EXPRESS INTEREST (AI TRAINING)
========================================================= */
export const interestInEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!user.interestWeights) user.interestWeights = new Map();

    event.tags.forEach((tag) => {
      const currentWeight = user.interestWeights.get(tag) || 0;
      user.interestWeights.set(tag, currentWeight + 1.5);
    });

    await user.save();
    res.json({ message: "Interest recorded. AI preferences updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   RATE EVENT (SUPERVISED LEARNING)
========================================================= */
export const rateEvent = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1–5" });

    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if user already rated this event
    const existingRatingIndex = event.ratings.findIndex(
      r => r.studentId?.toString() === user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      event.ratings[existingRatingIndex].rating = rating;
      event.markModified('ratings');
    } else {
      // Add new rating
      event.ratings.push({ studentId: user._id, rating });
    }
    await event.save();

    // Update user's interest weights based on rating
    const adjustment = rating >= 4 ? 2 : rating <= 2 ? -2 : 0;
    if (event.tags && event.tags.length > 0) {
      event.tags.forEach((tag) => {
        if (!user.interestWeights) user.interestWeights = new Map();
        const currentWeight = user.interestWeights.get(tag) || 0;
        user.interestWeights.set(tag, Math.max(0, currentWeight + adjustment));
      });
      await user.save();
    }

    // Calculate updated stats
    const avgRating = event.ratings.length > 0
      ? parseFloat((event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1))
      : 0;

    res.json({ 
      success: true, 
      message: existingRatingIndex !== -1 ? "Rating updated!" : "Rating submitted!",
      avgRating,
      ratingCount: event.ratings.length,
      userRating: rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   UPDATE EVENT
========================================================= */
export const updateEvent = async (req, res) => {
  try {
    // Fetch the existing event first to compare
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updateData = req.body;

    // Check if date/time is being updated
    const dateChanged = updateData.date && updateData.date !== existingEvent.date;
    const timeChanged = updateData.time && updateData.time !== existingEvent.time;
    const statusChanged = updateData.status && updateData.status !== existingEvent.status;

    // Apply the update
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Handle reminder job updates
    if (event.status === 'approved') {
      if (dateChanged || timeChanged) {
        // Event time changed - update reminder jobs with new schedule
        try {
          await updateEventReminders(event._id);
          console.log(`[EventUpdate] Reminder jobs updated for event ${event._id} due to time change`);
        } catch (schedulerErr) {
          console.error(`[EventUpdate] Failed to update reminders for event ${event._id}:`, schedulerErr.message);
        }
      }

      // If status changed from approved to something else (rejected), cancel reminders
      if (statusChanged && existingEvent.status === 'approved' && event.status !== 'approved') {
        try {
          await cancelEventReminders(event._id);
          console.log(`[EventUpdate] Cancelled reminder jobs for event ${event._id} (status changed to ${event.status})`);
        } catch (schedulerErr) {
          console.error(`[EventUpdate] Failed to cancel reminders for event ${event._id}:`, schedulerErr.message);
        }
      }

      // Broadcast update to all recipients
      await broadcastEvent(event, true);
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   DELETE EVENT
========================================================= */
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Cancel any scheduled reminder jobs before deletion
    try {
      await cancelEventReminders(eventId);
      console.log(`[EventDelete] Cancelled reminder jobs for event ${eventId}`);
    } catch (schedulerErr) {
      console.error(`[EventDelete] Failed to cancel reminders for event ${eventId}:`, schedulerErr.message);
      // Continue with deletion even if cancellation fails
    }

    await Event.findByIdAndDelete(eventId);
    res.json({ message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET EVENT DETAILS
========================================================= */
export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email school department",
    );
    if (!event) return res.status(404).json({ message: "Event not found" });

    const avgRating =
      event.ratings.length > 0
        ? (
            event.ratings.reduce((sum, r) => sum + r.rating, 0) /
            event.ratings.length
          ).toFixed(1)
        : 0;

    let matchScore = null;
    if (req.user) {
      const user = await User.findById(req.user.id);
      matchScore = calculateMatchScore(user, event);
    }

    res.json({
      ...event._doc,
      avgRating,
      ratingCount: event.ratings.length,
      userMatchScore: matchScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET ALL EVENTS
========================================================= */
export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, school, dept, level } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Admin/Principal get all events, other roles get scoped
    const userRole = req.user?.role;
    const isAdminOrPrincipal = ['admin', 'principal'].includes(userRole);

    // Search by title or location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply filters for non-admin users or if explicitly specified
    if (school && (isAdminOrPrincipal || req.user?.school)) query.targetSchool = school;
    if (dept && (isAdminOrPrincipal || req.user?.department)) query.targetDept = dept;

    const numericLevel = Number(level);
    if (!isNaN(numericLevel)) {
      query.targetLevel = numericLevel;
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   SEARCH EVENTS
========================================================= */
export const searchEvents = async (req, res) => {
  try {
    const { q, tags } = req.query;
    let query = {};

    if (q)
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];

    if (tags) query.tags = { $in: typeof tags === "string" ? [tags] : tags };

    const events = await Event.find(query).sort({ createdAt: -1 }).limit(20);
    res.json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET EVENTS BY DEPARTMENT
========================================================= */
export const getEventsByDepartment = async (req, res) => {
  try {
    const { dept } = req.query;
    if (!dept) return res.status(400).json({ message: "Department required" });
    const events = await Event.find({ targetDept: dept }).sort({
      createdAt: -1,
    });
    res.json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET EVENT STATS
========================================================= */
export const getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { attended } = req.query;
    let attendeesList = null;

    // If requested, get list of attendees
    if (attended === 'true') {
      const attendees = await EventRSVP.find({ eventId: event._id, attended: true })
        .populate('userId', 'name email role department profilePicture')
        .lean();
      attendeesList = attendees.map(a => ({
        _id: a._id,
        name: a.userId?.name,
        email: a.userId?.email,
        role: a.userId?.role,
        department: a.userId?.department?.name || a.userId?.department,
        profilePicture: a.userId?.profilePicture,
        attendedAt: a.attendedAt || a.updatedAt
      }));
    }

    // Calculate attendance stats from EventRSVP
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
      totalRatings: event.ratings.length,
      avgRating:
        event.ratings.length > 0
          ? (
              event.ratings.reduce((sum, r) => sum + r.rating, 0) /
              event.ratings.length
            ).toFixed(1)
          : 0,
      attendees: attendeesList
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   PENDING APPROVALS
========================================================= */
export const getPendingApprovals = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    let query = { status: "pending" };

    if (admin.role === "dean") query.targetSchool = admin.school;
    else if (admin.role === "lecturer") query.targetDept = admin.department;

    const events = await Event.find(query)
      .populate("createdBy", "name role department")
      .sort({ createdAt: -1 });
    res.json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   PROCESS APPROVAL
========================================================= */
export const processApproval = async (req, res) => {
  try {
    const { pulseId } = req.params;
    const { action, rejectionReason } = req.body;
    const event = await Event.findById(pulseId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (action === "reject") {
      event.status = "rejected";
      event.rejectionReason = rejectionReason || "No reason provided.";
      await event.save();
      return res.json({ message: "Event rejected.", event });
    }

    if (action === "approve") {
      event.status = "approved";
      event.approvedBy = req.user.id;
      await event.save();

      // Schedule reminder notifications (24h and 1h before event)
      try {
        await scheduleEventReminders(event._id);
        console.log(`[EventApproval] Reminder jobs scheduled for event ${event._id}`);
      } catch (schedulerErr) {
        console.error(`[EventApproval] Failed to schedule reminders for event ${event._id}:`, schedulerErr.message);
        // Continue - don't fail the approval if scheduling fails
      }

      await broadcastEvent(event);
      return res.json({
        success: true,
        message: "Event approved and broadcasted.",
        event,
      });
    }

    res.status(400).json({ message: "Invalid action." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   BROADCAST HELPER (REUSABLE & HIGH PERFORMANCE)
========================================================= */
export const broadcastEvent = async (event, isUpdate = false) => {
  try {
    const recipients = await getTargetedUsers(event);

    if (!recipients || recipients.length === 0) {
      console.log("No recipients found for this broadcast.");
      return;
    }

    const baseTitle = isUpdate ? `⚠️ UPDATED: ${event.title}` : `📅 New Event: ${event.title}`;
    const baseMessage = event.location
      ? `${event.location} | ${new Date(event.date).toLocaleDateString()} at ${event.time}`
      : event.description;

    // ==========================================
    // AI PERSONALIZATION: Generate variants per role
    // ==========================================
    let personalizedMap;
    try {
      personalizedMap = await getPersonalizedContentBatch(baseTitle, baseMessage, recipients);
    } catch (err) {
      console.error('[Personalization] Failed in broadcastEvent, using generic content:', err.message);
      personalizedMap = new Map();
      recipients.forEach(u => personalizedMap.set(u._id.toString(), { title: baseTitle, message: baseMessage }));
    }

    // 1. Prepare bulk notifications for the In-App Bell Icon with personalized content
    const notificationDocs = recipients.map(student => {
      const variant = personalizedMap.get(student._id.toString()) || { title: baseTitle, message: baseMessage };
      return {
        eventId: event._id,
        studentId: student._id,
        title: variant.title,
        message: variant.message,
        type: 'event',
        status: 'unread',
        priority: event.priority || 'medium',
        digestedAt: null
      };
    });

    // Bulk Insert into MongoDB (1 write instead of 5,000 writes!)
    await NotificationLog.insertMany(notificationDocs);

    // 2. Extract valid FCM tokens with their personalized variants, respecting quiet hours
    const eventPriority = event.priority || 'medium';
    const validRecipients = recipients.filter(u => {
      const hasToken = u.fcmToken && u.fcmToken.trim() !== "";
      if (!hasToken) return false;
      // Check quiet hours: only send push if canSendNow returns true
      return shouldSendNow(u, eventPriority);
    });

    if (validRecipients.length > 0) {
      // Group tokens by their personalized variant (unique title+message) to minimize API calls
      const tokenGroups = new Map();
      validRecipients.forEach(user => {
        const variant = personalizedMap.get(user._id.toString()) || { title: baseTitle, message: baseMessage };
        const key = `${variant.title}|||${variant.message}`;
        if (!tokenGroups.has(key)) tokenGroups.set(key, { title: variant.title, body: variant.message, tokens: [] });
        tokenGroups.get(key).tokens.push(user.fcmToken);
      });

      // Send each group as a separate multicast (max 500 tokens per batch handled internally)
      const pushPromises = [];
      for (const { title, body, tokens } of tokenGroups.values()) {
        pushPromises.push(
          sendMulticastNotification(tokens, title, body).catch(err => {
            console.error(`[Personalization] Push failed for group of ${tokens.length} tokens:`, err.message);
          })
        );
      }
      await Promise.all(pushPromises);
    }

  } catch (error) {
    console.error("Broadcast Helper Error:", error);
  }
};

/* =========================================================
   CALENDAR EXPORT (ICS GENERATION)
========================================================= */
export const exportCalendar = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Fetch organizer (creator) info
    let organizer = "Unknown Organizer";
    if (event.createdBy) {
      const creator = await User.findById(event.createdBy).select('name email');
      if (creator) {
        organizer = `${creator.name} <${creator.email}>`;
      }
    }

    // Combine date and time into start Date object
    // Assume event.time is a string like "14:00" or "2:00 PM"
    const startDate = new Date(event.date);
    let startHour, startMinute;
    if (event.time) {
      const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        startHour = parseInt(timeMatch[1], 10);
        startMinute = parseInt(timeMatch[2], 10);
        if (timeMatch[3]?.toUpperCase() === 'PM' && startHour < 12) startHour += 12;
        if (timeMatch[3]?.toUpperCase() === 'AM' && startHour === 12) startHour = 0;
      } else {
        // fallback: parse as HH:mm
        const [h, m] = event.time.split(':');
        startHour = parseInt(h, 10);
        startMinute = parseInt(m, 10);
      }
    } else {
      // Default to 9:00 AM if no time provided
      startHour = 9;
      startMinute = 0;
    }
    startDate.setHours(startHour, startMinute, 0, 0);

    // Assume 1 hour duration for end time
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    // Format description with location
    const description = event.location
      ? `${event.description || ''}\n\nLocation: ${event.location}`
      : event.description || '';

    // Create ICS event object
    const icsEvent = {
      start: fromDateToIcalFormat(startDate),
      end: fromDateToIcalFormat(endDate),
      title: event.title,
      description: description,
      location: event.location || '',
      organizer: { name: organizer },
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      categories: ['University Event'],
      priority: 5
    };

    const { error, value } = createEvent(icsEvent);

    if (error) {
      console.error('[Calendar Export] ICS creation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate calendar file' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event._id}.ics"`);

    res.send(value);
  } catch (error) {
    console.error('[Calendar Export] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate calendar file' });
  }
};

/* =========================================================
   BOOKMARK (SAVE) EVENT - O(1) Toggle
========================================================= */
export const toggleBookmark = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Look for existing bookmark
    const existingBookmark = await Bookmark.findOne({ userId, eventId });

    if (existingBookmark) {
      // Remove it (Unbookmark)
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      return res.status(200).json({ success: true, isBookmarked: false, message: "Event removed from saved items" });
    } else {
      // Create new (Bookmark)
      await Bookmark.create({ userId, eventId });
      return res.status(200).json({ success: true, isBookmarked: true, message: "Event saved" });
    }
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* =========================================================
   GET BOOKMARKED EVENTS (Paginated)
========================================================= */
export const getBookmarkedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Count total before pagination for correct pagination data
    const total = await Bookmark.countDocuments({ userId });

    // Fetch bookmarks for user, populate the full event (no status match filter —
    // that filter silently nulls the populated field causing events to disappear)
    const bookmarks = await Bookmark.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('eventId');

    // Filter out orphaned bookmarks where the event document was deleted
    const validEvents = bookmarks
      .filter(b => b.eventId !== null && b.eventId !== undefined)
      .map(b => ({
        ...b.eventId._doc,
        isBookmarked: true  // These are all bookmarked by definition
      }));

    res.status(200).json({
      success: true,
      events: validEvents,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      }
    });

  } catch (error) {
    console.error("Get Bookmarked Events Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* =========================================================
   STUDENT QR CHECK-IN
========================================================= */
export const studentCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentIdentifier } = req.body;
    const userId = req.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Check if already checked in
    const alreadyCheckedIn = event.checkedInBy.some(
      checkin => checkin.studentId?.toString() === userId.toString()
    );

    if (alreadyCheckedIn) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already checked in to this event" 
      });
    }

    // Add check-in record
    event.checkedInBy.push({
      studentId: userId,
      studentIdentifier: studentIdentifier || studentId,
      checkedInAt: new Date()
    });

    await event.save();

    // Update user's attendance rate
    const user = await User.findById(userId);
    if (user) {
      const totalEvents = await Event.countDocuments({
        'checkedInBy.studentId': userId
      });
      // Calculate attendance rate (simplified - based on total events attended)
      user.attendanceRate = Math.min(100, totalEvents * 5); // 5% per event, max 100%
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Check-in successful! Attendance recorded.",
      checkedInAt: new Date()
    });

  } catch (error) {
    console.error("Check-in Error:", error);
    res.status(500).json({ success: false, message: "Check-in failed", error: error.message });
  }
};
