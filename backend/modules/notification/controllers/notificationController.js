import mongoose from "mongoose";
import nodemailer from "nodemailer";
import User from "../../user/model/User.js";
import NotificationLog from "../models/NotificationLog.js";
import { sendPushNotification } from "../../../config/firebaseAdmin.js";

// --- HELPERS ---
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
// 1. DISPATCH (HOD / ADMIN)
// ==========================================

export const sendNotification = async (req, res) => {
    try {
        const { targetUserId, email, name, fcmToken, message } = req.body;
        if (!email || !message || !targetUserId) {
            return res.status(400).json({ message: "Incomplete dispatch payload." });
        }

        const tasks = [];
        const channels = ["Email", "Database_Log"];

        // Email Task
        const transporter = getTransporter();
        tasks.push(transporter.sendMail({
            from: `"Dept Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Official Department Directive",
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1e40af;">Official Assignment</h2>
                    <p>Dear <strong>${name || "Staff Member"}</strong>,</p>
                    <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e40af; color: #1e293b;">
                        ${escapeHTML(message)}
                    </div>
                   </div>`,
        }));

        // DB Log Task
        tasks.push(NotificationLog.create({
            studentId: targetUserId,
            senderId: req.user.id,
            title: "Staff Directive",
            message: message,
            status: "unread",
            type: "action"
        }));

        // Push Task
        if (fcmToken) {
            channels.push("Push_Notification");
            tasks.push(sendPushNotification(fcmToken, "New Directive", message.substring(0, 80)));
        }

        const results = await Promise.allSettled(tasks);
        res.status(200).json({ success: true, report: results.map((r, i) => ({ channel: channels[i], status: r.status })) });
    } catch (error) {
        res.status(500).json({ message: "Dispatch failed." });
    }
};

export const getSentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const history = await NotificationLog.find({ senderId: req.user.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("studentId", "name email")
            .lean();

        const total = await NotificationLog.countDocuments({ senderId: req.user.id });
        res.json({ success: true, data: history, pagination: { total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: "History fetch failed." });
    }
};

// ==========================================
// 2. INBOX & UTILITIES (USER SIDE)
// ==========================================

export const getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationLog.find({ studentId: req.user.id })
            .sort({ createdAt: -1 })
            .populate("eventId", "title date time location")
            .lean();

        const unreadCount = await NotificationLog.countDocuments({ studentId: req.user.id, status: "unread" });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// THE MISSING PIECE THAT CAUSED YOUR CRASH
export const getNotificationDetails = async (req, res) => {
    try {
        const notification = await NotificationLog.findById(req.params.id)
            .populate("eventId")
            .populate("studentId", "name email")
            .lean();

        if (!notification) return res.status(404).json({ message: "Notification not found" });

        // Security check: User can only see their own notification
        if (notification.studentId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        await NotificationLog.findOneAndUpdate(
            { _id: req.params.id, studentId: req.user.id },
            { status: "read", readAt: Date.now() }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await NotificationLog.updateMany({ studentId: req.user.id, status: "unread" }, { status: "read", readAt: Date.now() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotificationSummary = async (req, res) => {
    try {
        const [total, unread, read] = await Promise.all([
            NotificationLog.countDocuments({ studentId: req.user.id }),
            NotificationLog.countDocuments({ studentId: req.user.id, status: 'unread' }),
            NotificationLog.countDocuments({ studentId: req.user.id, status: 'read' })
        ]);
        res.json({ summary: { total, unread, read } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await NotificationLog.countDocuments({ studentId: req.user.id, status: "unread" });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. ADMIN ANALYTICS
// ==========================================

export const getEventStats = async (req, res) => {
    try {
        const totalSent = await NotificationLog.countDocuments({ eventId: req.params.eventId });
        const totalRead = await NotificationLog.countDocuments({ eventId: req.params.eventId, status: "read" });
        res.json({ stats: { sent: totalSent, read: totalRead, rate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0 } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAIInsights = async (req, res) => {
    try {
        const insights = await User.aggregate([
            { $match: { department: req.query.dept } },
            { $unwind: "$interests" },
            { $group: { _id: "$interests", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await NotificationLog.findOneAndDelete({ _id: req.params.id, studentId: req.user.id });
        if (!notification) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};