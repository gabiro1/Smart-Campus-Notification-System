import Event from '../models/Event.js';
import User from '../models/User.js';
import NotificationLog from '../models/NotificationLog.js';
import { getTargetedUsers } from '../utils/notificationEngine.js';
import { sendPushNotification } from '../config/firebaseAdmin.js';
import { calculateMatchScore } from '../utils/mlEngine.js';

/* =========================================================
   BROADCAST HELPER (REUSABLE)
========================================================= */
export const broadcastEvent = async (event, isUpdate = false) => {
    const recipients = await getTargetedUsers(event);
    for (const student of recipients) {
        if (!student.fcmToken) continue;
        await sendPushNotification(
            student.fcmToken,
            isUpdate ? `⚠️ UPDATED: ${event.title}` : event.title,
            event.description
        );
        await NotificationLog.create({
            eventId: event._id,
            studentId: student._id
        });
    }
};

/* =========================================================
   CREATE EVENT (WITH APPROVAL WORKFLOW)
========================================================= */
export const createEvent = async (req, res) => {
    try {
        const eventData = { ...req.body, createdBy: req.user.id };
        let status = 'pending';
        let approvalLevel = 'none';

        if (req.user.role === 'admin') status = 'approved';
        else if (req.user.role === 'hod') approvalLevel = 'school';
        else if (req.user.role === 'lecturer') approvalLevel = 'department';

        const event = new Event({ ...eventData, status, approvalLevel });
        await event.save();

        if (status === 'approved') await broadcastEvent(event);

        res.status(201).json({
            success: true,
            message:
                status === 'pending'
                    ? 'Event submitted for approval.'
                    : 'Event broadcasted successfully.',
            event
        });
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   STUDENT FEED (AI RANKING)
========================================================= */
// controllers/eventController.js (or wherever this lives)
export const getStudentFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Safely convert level to number
    const levelNumber = Number(user.level);

    // Base conditions that are always valid
    const orConditions = [
      { targetSchool: user.school },
      { targetLevel: 0 } // events for all levels
    ];

    // Only add dept + level condition if level is a valid number
    if (!isNaN(levelNumber)) {
      orConditions.push({
        targetDept: user.department,
        targetLevel: levelNumber
      });
    }

    const events = await Event.find({
      status: 'approved',
      $or: orConditions
    });

    const rankedFeed = events
      .map(event => ({
        ...event._doc,
        aiMatchScore: calculateMatchScore(user, event)
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

        event.tags.forEach(tag => {
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
        event.tags.forEach(tag => {
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
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: "Event not found" });
        await broadcastEvent(event, true);
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
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email school department');
        if (!event) return res.status(404).json({ message: "Event not found" });

        const avgRating = event.ratings.length > 0
            ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
            : 0;

        let matchScore = null;
        if (req.user) {
            const user = await User.findById(req.user.id);
            matchScore = calculateMatchScore(user, event);
        }

        res.json({ ...event._doc, avgRating, ratingCount: event.ratings.length, userMatchScore: matchScore });
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

        // Only include targetLevel if it is a valid number
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
                currentPage: Number(page)
            }
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

        if (q) query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];

        if (tags) query.tags = { $in: typeof tags === 'string' ? [tags] : tags };

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
        const events = await Event.find({ targetDept: dept }).sort({ createdAt: -1 });
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
            avgRating: event.ratings.length > 0 ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1) : 0
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
        let query = { status: 'pending' };

        if (admin.role === 'dean') query.targetSchool = admin.school;
        else if (admin.role === 'lecturer') query.targetDept = admin.department;

        const events = await Event.find(query).populate('createdBy', 'name role department').sort({ createdAt: -1 });
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

        if (action === 'reject') {
            event.status = 'rejected';
            event.rejectionReason = rejectionReason || "No reason provided.";
            await event.save();
            return res.json({ message: "Event rejected.", event });
        }

        if (action === 'approve') {
            event.status = 'approved';
            event.approvedBy = req.user.id;
            await event.save();
            await broadcastEvent(event);
            return res.json({ success: true, message: "Event approved and broadcasted.", event });
        }

        res.status(400).json({ message: "Invalid action." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};