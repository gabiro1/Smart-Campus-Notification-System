import Event from '../models/Event.js';
import User from '../models/User.js';
import NotificationLog from '../models/NotificationLog.js';
import { getTargetedUsers } from '../utils/notificationEngine.js';
import { sendPushNotification } from '../config/firebaseAdmin.js';
import { calculateMatchScore} from '../utils/mlEngine.js'

// @desc    Create and Broadcast Event with AI Targeting
export const createEvent = async (req, res) => {
    try {
        const event = new Event({ ...req.body, createdBy: req.user.id });
        await event.save();

        const recipients = await getTargetedUsers(event);
        
        recipients.forEach(student => {
            // Determine if this is a "High Match" for this specific student
            const matchScore = calculateMatchScore(student, event);
            const alertTitle = matchScore > 5 ? `🔥 Recommended: ${event.title}` : event.title;

            sendPushNotification(student.fcmToken, alertTitle, event.description);
            
            NotificationLog.create({ 
                eventId: event._id, 
                studentId: student._id,
                aiMatchScore: matchScore // Log for analytics
            });
        });

        res.status(201).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Ranked AI Feed (Machine Learning Ranking)
export const getStudentFeed = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { school, department, level } = user;

        // 1. Fetch relevant events
        const events = await Event.find({
            $or: [
                { targetSchool: school },
                { targetDept: department, targetLevel: level },
                { targetLevel: 0 }
            ]
        });

        // 2. ML Ranking: Map events and inject the AI match score
        const rankedFeed = events.map(event => {
            const matchScore = calculateMatchScore(user, event);
            return { ...event._doc, matchScore };
        }).sort((a, b) => b.matchScore - a.matchScore); // Highest match at the top

        res.json(rankedFeed);
    } catch (error) {
        res.status(500).json({ message: "Error fetching AI feed" });
    }
};

// @desc    RSVP / Express Interest (AI Training Point)
export const interestInEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!event) return res.status(404).json({ message: "Event not found" });

        // AI Logic: Boost weights for tags in this event
        event.tags.forEach(tag => {
            const currentWeight = user.interestWeights.get(tag) || 0;
            user.interestWeights.set(tag, currentWeight + 1.5); // Boost by 1.5 for interest
        });

        await user.save();
        res.json({ message: "Reminder set. Your AI preferences have been updated." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate Event (Supervised Feedback for AI)
export const rateEvent = async (req, res) => {
    try {
        const { rating } = req.body; // 1 to 5
        const event = await Event.findById(req.params.id);
        const user = await User.findById(req.user.id);

        event.ratings.push({ studentId: user._id, rating });
        await event.save();

        // AI Weight Adjustment
        // High rating (4-5) = increase weight; Low rating (1-2) = decrease weight
        const adjustment = rating >= 4 ? 2 : (rating <= 2 ? -2 : 0);
        
        event.tags.forEach(tag => {
            const currentWeight = user.interestWeights.get(tag) || 0;
            const newWeight = Math.max(0, currentWeight + adjustment);
            user.interestWeights.set(tag, newWeight);
        });

        await user.save();
        res.json({ message: "Rating submitted. AI personalized your feed." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Event (Change Notification)
export const updateEvent = async (req, res) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (event) {
        const recipients = await getTargetedUsers(event);
        recipients.forEach(s => 
            sendPushNotification(s.fcmToken, `⚠️ UPDATED: ${event.title}`, "Details have changed. Tap to view.")
        );
        res.json(event);
    }
};

// @desc    Delete Event
export const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event details by ID
export const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email school department');

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Calculate average rating
        const avgRating = event.ratings.length > 0
            ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
            : 0;

        // Get match score for current user if authenticated
        let matchScore = null;
        if (req.user) {
            const user = await User.findById(req.user.id);
            matchScore = calculateMatchScore(user, event);
        }

        res.json({
            ...event._doc,
            avgRating,
            ratingCount: event.ratings.length,
            userMatchScore: matchScore
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all events with pagination
export const getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, school, dept, level } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (school) query.targetSchool = school;
        if (dept) query.targetDept = dept;
        if (level) query.targetLevel = level;

        const events = await Event.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(query);

        res.json({
            events,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search events
export const searchEvents = async (req, res) => {
    try {
        const { q, tags } = req.query;

        let query = {};

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        if (tags) {
            const tagArray = typeof tags === 'string' ? [tags] : tags;
            query.tags = { $in: tagArray };
        }

        const events = await Event.find(query)
            .limit(20)
            .sort({ createdAt: -1 });

        res.json({
            count: events.length,
            events
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get event statistics
export const getEventStats = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const stats = {
            eventId: event._id,
            title: event.title,
            totalRatings: event.ratings.length,
            averageRating: event.ratings.length > 0
                ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
                : 0,
            ratingDistribution: {
                5: event.ratings.filter(r => r.rating === 5).length,
                4: event.ratings.filter(r => r.rating === 4).length,
                3: event.ratings.filter(r => r.rating === 3).length,
                2: event.ratings.filter(r => r.rating === 2).length,
                1: event.ratings.filter(r => r.rating === 1).length
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get events by department
export const getEventsByDepartment = async (req, res) => {
    try {
        const { dept } = req.query;

        if (!dept) {
            return res.status(400).json({ message: "Department parameter is required" });
        }

        const events = await Event.find({ targetDept: dept })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email school');

        res.json({
            department: dept,
            count: events.length,
            events
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique departments from events
export const getDepartments = async (req, res) => {
    try {
        const departments = await Event.distinct('targetDept');

        res.json({
            departments: departments.filter(d => d) // Remove null/empty values
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};