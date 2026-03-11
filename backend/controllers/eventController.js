import Event from "../models/Event.js";
import User from "../models/User.js";
import NotificationLog from "../models/NotificationLog.js";
import { getTargetedUsers } from "../utils/notificationEngine.js";
import { sendPushNotification } from "../config/firebaseAdmin.js";
import { calculateMatchScore } from "../utils/mlEngine.js";
import Tesseract from "tesseract.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { sendMulticastNotification } from "../config/firebaseAdmin.js";

/* =========================================================
   AI FLYER PARSING
========================================================= */
export const parseFlyer = async (req, res) => {
  try {

    /* -------------------------------
       1️⃣ Validate API Key
    -------------------------------- */
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY missing in .env");
      return res.status(500).json({
        message: "Server AI configuration error"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

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
"title": "string",
"date": "YYYY-MM-DD",
"time": "HH:MM",
"location": "string",
"description": "1-2 sentence summary",
"tags": ["tag1","tag2"]
}

If a field is missing return null.

OCR TEXT:
${extractedText}
`;

    /* -------------------------------
       5️⃣ Send Text To Gemini
    -------------------------------- */
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const aiResponse = result.text;

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
    const eventData = { ...req.body, createdBy: req.user.id };
    let status = "pending";
    let approvalLevel = "none";

    // Role-based workflow logic
    if (req.user.role === "admin") {
      status = "approved";
    } else if (req.user.role === "hod") {
      approvalLevel = "school";
    } else if (req.user.role === "lecturer") {
      approvalLevel = "department";
    }
    // Note: guild_president will default to 'pending' and 'none'.
    // If you want them to auto-approve, add them to the 'admin' condition above.

    const event = new Event({ ...eventData, status, approvalLevel });
    await event.save();

    if (status === "approved") {
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
    if (!user) return res.status(404).json({ message: "User not found" });

    const levelNumber = Number(user.level);
    const orConditions = [{ targetSchool: user.school }, { targetLevel: 0 }];

    if (!isNaN(levelNumber)) {
      orConditions.push({
        targetDept: user.department,
        targetLevel: levelNumber,
      });
    }

    const events = await Event.find({
      status: "approved",
      $or: orConditions,
    });

    const rankedFeed = events
      .map((event) => ({
        ...event._doc,
        aiMatchScore: calculateMatchScore(user, event),
      }))
      .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    res.json(rankedFeed);
  } catch (error) {
    console.error("Feed Error:", error);
    res.status(500).json({ message: error.message });
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

    event.ratings.push({ studentId: user._id, rating });
    await event.save();

    const adjustment = rating >= 4 ? 2 : rating <= 2 ? -2 : 0;
    event.tags.forEach((tag) => {
      const currentWeight = user.interestWeights.get(tag) || 0;
      user.interestWeights.set(tag, Math.max(0, currentWeight + adjustment));
    });

    await user.save();
    res.json({ message: "Rating submitted. AI updated." });
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
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status === "approved") {
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
    await Event.findByIdAndDelete(req.params.id);
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
    const { page = 1, limit = 10, school, dept, level } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (school) query.targetSchool = school;
    if (dept) query.targetDept = dept;

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

    const stats = {
      eventId: event._id,
      title: event.title,
      totalRatings: event.ratings.length,
      avgRating:
        event.ratings.length > 0
          ? (
              event.ratings.reduce((sum, r) => sum + r.rating, 0) /
              event.ratings.length
            ).toFixed(1)
          : 0,
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

    const notifTitle = isUpdate ? `⚠️ UPDATED: ${event.title}` : `📅 New Event: ${event.title}`;
    
    // Fallback format just in case event.date or event.time are missing
    const notifMessage = event.location 
      ? `${event.location} | ${new Date(event.date).toLocaleDateString()} at ${event.time}`
      : event.description;

    // 1. Prepare bulk notifications for the In-App Bell Icon
    const notificationDocs = recipients.map(student => ({
      eventId: event._id,
      studentId: student._id,
      title: notifTitle,
      message: notifMessage,
      type: 'event',
      status: 'unread'
    }));

    // Bulk Insert into MongoDB (1 write instead of 5,000 writes!)
    await NotificationLog.insertMany(notificationDocs);

    // 2. Extract valid FCM tokens for Mobile Push Notifications
    const validFcmTokens = recipients
      .map(student => student.fcmToken)
      .filter(token => token !== undefined && token !== null && token.trim() !== "");

    if (validFcmTokens.length > 0) {
      // Send to Firebase (which will handle batching them in chunks of 500)
      await sendMulticastNotification(
        validFcmTokens,
        notifTitle,
        event.description
      );
    }
    
  } catch (error) {
    console.error("Broadcast Helper Error:", error);
  }
};
