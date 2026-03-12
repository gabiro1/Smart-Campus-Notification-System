import NotificationLog from '../models/NotificationLog.js';
import User from '../models/User.js';

// @desc    Mark notification as Read
// This tells the AI that the student saw the event
export const markAsRead = async (req, res) => {
    try {
        const log = await NotificationLog.findOneAndUpdate(
            { eventId: req.params.eventId, studentId: req.user.id },
            { status: 'read', receivedAt: Date.now() },
            { new: true }
        );
        res.json({ success: true, log });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Stats for Admin (The "Read Receipts" Dashboard)
// Shows the Dean: "60% of Level 4 IT read this message"
export const getEventStats = async (req, res) => {
    try {
        const totalSent = await NotificationLog.countDocuments({ eventId: req.params.eventId });
        const totalRead = await NotificationLog.countDocuments({ 
            eventId: req.params.eventId, 
            status: 'read' 
        });

        res.json({
            eventId: req.params.eventId,
            stats: {
                sent: totalSent,
                read: totalRead,
                readRate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI Insights (Most active interests)
// Used to suggest what forums the school should host next
export const getAIInsights = async (req, res) => {
    try {
        // Aggregates interests from all students in a specific department
        const insights = await User.aggregate([
            { $match: { department: req.query.dept } },
            { $unwind: "$interests" },
            { $group: { _id: "$interests", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notifications for current user
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const notifications = await NotificationLog.find({ studentId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('eventId', 'title description');

        const total = await NotificationLog.countDocuments({ studentId: req.user.id });

        res.json({
            notifications,
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

// @desc    Get single notification details
export const getNotificationDetails = async (req, res) => {
    try {
        const notification = await NotificationLog.findById(req.params.id)
            .populate('eventId')
            .populate('studentId', 'name email');

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Check authorization - user can only see their own notifications
        if (notification.studentId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this notification" });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read for current user
export const markAllAsRead = async (req, res) => {
    try {
        const result = await NotificationLog.updateMany(
            { studentId: req.user.id, status: 'unread' },
            { status: 'read', readAt: Date.now() }
        );

        res.json({
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a specific notification
export const deleteNotification = async (req, res) => {
    try {
        const notification = await NotificationLog.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Check authorization
        if (notification.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this notification" });
        }

        await NotificationLog.findByIdAndDelete(req.params.id);

        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notification summary for current user
export const getNotificationSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalCount = await NotificationLog.countDocuments({ studentId: userId });
        const unreadCount = await NotificationLog.countDocuments({ studentId: userId, status: 'unread' });
        const readCount = await NotificationLog.countDocuments({ studentId: userId, status: 'read' });

        // Get summary by event
        const byEvent = await NotificationLog.aggregate([
            { $match: { studentId: require('mongoose').Types.ObjectId(userId) } },
            { $group: {
                _id: '$eventId',
                count: { $sum: 1 },
                unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } }
            }},
            { $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: '_id',
                as: 'event'
            }},
            { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } }
        ]);

        res.json({
            summary: {
                total: totalCount,
                unread: unreadCount,
                read: readCount
            },
            byEvent
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await NotificationLog.countDocuments({
            studentId: req.user.id,
            status: 'unread'
        });

        res.json({
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};