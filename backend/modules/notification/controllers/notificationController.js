import mongoose from "mongoose";
import nodemailer from "nodemailer";
import NotificationLog from "../models/NotificationLog.js";
import User from "../../user/model/User.js";
import { sendPushNotification, subscribeToTopics } from "../../../config/firebaseAdmin.js";

// --- EMAIL HELPER ---
const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });
};

const escapeHTML = (str) => {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
};

// ==========================================
// 1. INBOX & UTILITIES (STUDENT SIDE)
// ==========================================

export const getNotifications = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        // 🔧 ARCHITECTURE: We removed .populate('eventId') because your new schema 
        // uses a generic 'referenceId' to prevent database crashes. The frontend 
        // will use the title/message directly from this log.
        const notifications = await NotificationLog.find({ studentId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await NotificationLog.countDocuments({ studentId: req.user._id });
        const unreadCount = await NotificationLog.countDocuments({ studentId: req.user._id, status: "unread" });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch inbox." });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const studentId = req.user._id;
        const count = await NotificationLog.countDocuments({ studentId: req.user._id, status: "unread" });
        res.status(200).json({ success: true, unreadCount: count });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch unread count." });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user._id;

        const log = await NotificationLog.findOneAndUpdate(
            { _id: id, studentId: req.user._id },
            { status: "read", readAt: Date.now() },
            { new: true }
        );

        if (!log) return res.status(404).json({ success: false, message: "Notification not found." });

        res.status(200).json({ success: true, data: log });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark as read." });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const studentId = req.user._id;
        
        const result = await NotificationLog.updateMany(
            { studentId: req.user._id, status: "unread" }, 
            { status: "read", readAt: Date.now() }
        );

        res.status(200).json({ 
            success: true, 
            message: `Marked ${result.modifiedCount} notifications as read.` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark all as read." });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user._id;

        const notification = await NotificationLog.findOneAndDelete({ _id: id, studentId: req.user._id });
        
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true, message: "Notification deleted from inbox." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete notification." });
    }
};

export const getNotificationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user._id;

        const notification = await NotificationLog.findOne({ _id: id, studentId });
        
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch notification details." });
    }
};

export const getNotificationSummary = async (req, res) => {
    try {
        const studentId = req.user._id;
        const [total, unread, read] = await Promise.all([
            NotificationLog.countDocuments({ studentId }),
            NotificationLog.countDocuments({ studentId, status: 'unread' }),
            NotificationLog.countDocuments({ studentId, status: 'read' })
        ]);
        res.status(200).json({ success: true, summary: { total, unread, read } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch summary." });
    }
};

// ==========================================
// 2. DEVICE MANAGEMENT (FIREBASE TOPICS)
// ==========================================

export const registerDevice = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({ success: false, message: "FCM token is required." });
        }

        const user = await User.findById(req.user._id)
            .populate('department')
            .populate('college');

        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        // 1. Update user profile with the new token
        user.fcmToken = fcmToken;
        await user.save();

        // 2. Prepare topics based on user's academic hierarchy
        const sanitize = (str) => str?.toString().replace(/[^a-zA-Z0-9-_.~%]/g, '_') || 'unknown';
        const topics = [];
        
        // Topic: Department
        if (user.department?.code) topics.push(`topic_dept_${sanitize(user.department.code)}`);
        else if (user.department) topics.push(`topic_dept_${sanitize(user.department._id)}`);

        // Topic: Level
        if (user.level) topics.push(`topic_level_${sanitize(user.level)}`);

        // Topic: Campus/College
        if (user.college?.code) topics.push(`topic_campus_${sanitize(user.college.code)}`);
        else if (user.college) topics.push(`topic_campus_${sanitize(user.college._id)}`);

        // Topic: Specific Class (Crucial for Course Announcements)
        if (user.classId) topics.push(`topic_class_${sanitize(user.classId)}`);

        // 3. Batch subscribe via Firebase Admin
        if (topics.length > 0) {
            await subscribeToTopics(fcmToken, topics);
        }

        res.status(200).json({
            success: true,
            message: "Device registered and topics updated.",
            topicsAttached: topics
        });

    } catch (error) {
        console.error("Device Registration Error:", error);
        res.status(500).json({ success: false, message: "Failed to register device." });
    }
};

// ==========================================
// 3. DISPATCH & ANALYTICS (HOD / ADMIN SIDE)
// ==========================================

export const sendNotification = async (req, res) => {
    try {
        const { targetUserId, email, name, fcmToken, message, title = "Official Directive" } = req.body;
        const senderId = req.user._id;

        if (!email || !message || !targetUserId) {
            return res.status(400).json({ success: false, message: "Incomplete dispatch payload." });
        }

        const tasks = [];
        const channels = ["Database_Log"];

        // 1. DB Log Task (Always happens)
        tasks.push(NotificationLog.create({
            studentId: targetUserId,
            senderId: senderId,
            title: title,
            message: message,
            status: "unread",
            type: "action"
        }));

        // 2. Email Task
        const transporter = getTransporter();
        tasks.push(transporter.sendMail({
            from: `"Department Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: title,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1e40af;">${escapeHTML(title)}</h2>
                    <p>Dear <strong>${name || "Student"}</strong>,</p>
                    <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e40af; color: #1e293b;">
                        ${escapeHTML(message)}
                    </div>
                   </div>`,
        }).then(() => channels.push("Email")));

        // 3. Push Task (If token exists)
        if (fcmToken) {
            tasks.push(sendPushNotification(fcmToken, title, message.substring(0, 80))
                .then(() => channels.push("Push_Notification"))
            );
        }

        // Wait for all channels to attempt delivery
        const results = await Promise.allSettled(tasks);
        
        res.status(200).json({ 
            success: true, 
            message: "Dispatch complete.",
            channelsActived: channels 
        });
    } catch (error) {
        console.error("Dispatch Error:", error);
        res.status(500).json({ success: false, message: "Dispatch failed." });
    }
};

export const getSentHistory = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const history = await NotificationLog.find({ senderId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("studentId", "name email")
            .lean();

        const total = await NotificationLog.countDocuments({ senderId: req.user._id });
        
        res.status(200).json({ 
            success: true, 
            data: history, 
            pagination: { 
                total, 
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "History fetch failed." });
    }
};

export const getBroadcastStats = async (req, res) => {
    try {
        const { referenceId } = req.params;

        const totalSent = await NotificationLog.countDocuments({ referenceId });
        const totalRead = await NotificationLog.countDocuments({ referenceId, status: "read" });

        res.status(200).json({ 
            success: true,
            stats: { 
                sent: totalSent, 
                read: totalRead, 
                readRate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) + '%' : '0%' 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch stats." });
    }
};

// Alias for backward compatibility with routes
export const getEventStats = getBroadcastStats;

export const getAIInsights = async (req, res) => {
    try {
        const insights = await User.aggregate([
            { $match: { department: req.query.dept } },
            { $unwind: "$interests" },
            { $group: { _id: "$interests", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({ success: true, insights });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch AI insights." });
    }
};