import mongoose from "mongoose";
import nodemailer from "nodemailer";
import NotificationLog from "../models/NotificationLog.js";
import User from "../../user/model/User.js";
import { sendPushNotification, subscribeToTopics } from "../../../config/firebaseAdmin.js";
import { sendSMSViaTwilio } from "../../../services/smsService.js";
import { summarizeNotifications } from "../../../services/aiProvider.js";
import { generateVariantForRole } from "../../../services/aiPersonalizationService.js";
import { generateAndSendDigest } from "../../../services/digestService.js";
import { shouldSendNow } from "../../../utils/quietHours.js";

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

        // 1. Update user profile with the new token (always succeeds independently)
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

        // 3. Batch subscribe via Firebase Admin (non-fatal — credential errors won't crash this)
        let topicsResult = { success: true };
        if (topics.length > 0) {
            topicsResult = await subscribeToTopics(fcmToken, topics);
            if (!topicsResult.success) {
                console.warn(`[DeviceRegistration] Topic subscription failed for user ${user._id}: ${topicsResult.error}`);
                console.warn(`[DeviceRegistration] FCM token was saved. To fix: regenerate your Firebase service account key at https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk`);
            }
        }

        res.status(200).json({
            success: true,
            message: topicsResult.success
                ? "Device registered and topics updated."
                : "Device registered (FCM token saved). Topic subscriptions skipped due to a Firebase credential issue \u2014 push notifications may be delayed until resolved.",
            topicsAttached: topicsResult.success ? topics : [],
            warning: topicsResult.success ? undefined : "Firebase credential invalid. Regenerate your service account key."
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
        const { targetUserId, email, name, fcmToken, message, title = "Official Directive", priority = "normal", category = "events" } = req.body;
        const senderId = req.user._id;

        if (!email || !message || !targetUserId) {
            return res.status(400).json({ success: false, message: "Incomplete dispatch payload." });
        }

        // Fetch target user to check preferences and contact info
        const targetUser = await User.findById(targetUserId).select('phoneNumber notificationPreferences');
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }

        const prefs = targetUser.notificationPreferences || {};
        const categoryPrefs = prefs.categories?.[category] || {};

        // Determine if a channel is enabled, with priority override
        const shouldSend = (channel) => {
          if (priority === 'critical') return true;
          // Check category-specific first, then global. Default true for push/email, false for sms.
          if (categoryPrefs[channel] !== undefined) return categoryPrefs[channel];
          return prefs[channel] ?? (channel === 'sms' ? false : true);
        };

        // Map priority to NotificationLog enum (normal -> medium)
        const mapPriority = (p) => {
          switch (p) {
            case 'low': return 'low';
            case 'medium': return 'medium';
            case 'high': return 'high';
            case 'critical': return 'critical';
            case 'normal': return 'medium';
            default: return 'medium';
          }
        };

        const tasks = [];
        const channels = ["Database_Log"];

        // ==========================================
        // AI PERSONALIZATION: Rewrite for recipient role
        // ==========================================
        let personalizedTitle = title;
        let personalizedMessage = message;
        try {
          const variant = await generateVariantForRole(title, message, targetUser.role || 'default');
          personalizedTitle = variant.title;
          personalizedMessage = variant.message;
        } catch (err) {
          console.warn('[Personalization] Failed to generate variant for direct notification, using original:', err.message);
        }

        // 1. DB Log Task (Always happens) - with personalized content and priority
        tasks.push(NotificationLog.create({
            studentId: targetUserId,
            senderId: senderId,
            title: personalizedTitle,
            message: personalizedMessage,
            status: "unread",
            type: category,
            priority: mapPriority(priority)
        }));

        // Check if we can send now based on quiet hours and priority
        const priorityMapped = mapPriority(priority);
        const canSendNow = shouldSendNow(targetUser, priorityMapped);

        // 2. Email Task (if enabled AND quiet hours allow)
        if (shouldSend('email') && canSendNow) {
            const transporter = getTransporter();
            tasks.push(
                transporter.sendMail({
                    from: `"Department Admin" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: personalizedTitle,
                    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h2 style="color: #1e40af;">${escapeHTML(personalizedTitle)}</h2>
                            <p>Dear <strong>${name || "Student"}</strong>,</p>
                            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e40af; color: #1e293b;">
                                ${escapeHTML(personalizedMessage)}
                            </div>
                           </div>`,
                }).then(() => channels.push("Email"))
                .catch((emailErr) => {
                    console.warn(`[Notification] Email failed for user ${targetUserId}:`, emailErr.message);
                })
            );
        }

        // 3. Push Task (If token exists and enabled AND quiet hours allow)
        if (fcmToken && shouldSend('push') && canSendNow) {
            tasks.push(
                sendPushNotification(fcmToken, personalizedTitle, personalizedMessage.substring(0, 80))
                    .then(() => channels.push("Push_Notification"))
                    .catch((pushErr) => {
                        console.warn(`[Notification] Push failed for user ${targetUserId}:`, pushErr.message);
                    })
            );
        }

        // 4. SMS Task (If user has phone number and enabled AND quiet hours allow)
        if (targetUser.phoneNumber && shouldSend('sms') && canSendNow) {
            const smsMessage = `${personalizedTitle}: ${personalizedMessage.substring(0, 160)}`;
            tasks.push(
                sendSMSViaTwilio(targetUser.phoneNumber, smsMessage)
                    .then((result) => {
                        channels.push("SMS");
                        return result;
                    })
                    .catch((smsErr) => {
                        console.warn(`[Notification] SMS failed for user ${targetUserId}:`, smsErr.message);
                        return { sid: null, error: smsErr.message };
                    })
            );
        }

        // Wait for all channels to attempt delivery
        const results = await Promise.allSettled(tasks);

        res.status(200).json({
            success: true,
            message: "Dispatch complete.",
            channelsActived: channels,
            priority
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

/* =========================================================
   AI DIGEST GENERATOR (Now uses shared digestService)
========================================================= */
export const generateDigest = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const result = await generateAndSendDigest(req.user, { period, filterPriority: 'low' });

    if (result.skipped) {
      return res.json({
        success: true,
        message: 'No unread low-priority notifications in the selected period.',
        summary: null,
        period,
        notificationCount: 0,
      });
    }

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }

    res.status(200).json({
      success: true,
      summary: result.summary,
      period,
      notificationCount: result.notificationCount,
    });
  } catch (error) {
    console.error('[Digest] Generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate digest' });
  }
};

/* =========================================================
   GET LATEST DIGEST (Cached)
========================================================= */
export const getLatestDigest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastDigestSummary lastDigestAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      summary: user.lastDigestSummary,
      generatedAt: user.lastDigestAt,
    });
  } catch (error) {
    console.error('[Digest] Fetch latest error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch latest digest' });
  }
};

// ==========================================
// 4. EMERGENCY ACKNOWLEDGMENT SYSTEM
// ==========================================

/**
 * POST /api/notifications/:id/acknowledge
 * Student acknowledges an emergency notification
 */
export const acknowledgeNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const notification = await NotificationLog.findOne({
      _id: id,
      studentId: studentId,
      requiresAcknowledgment: true
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Emergency notification not found or does not require acknowledgment'
      });
    }

    if (notification.acknowledgedAt) {
      return res.status(200).json({
        success: true,
        message: 'Notification already acknowledged',
        data: notification
      });
    }

    // Set acknowledgment timestamp
    notification.acknowledgedAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Emergency notification acknowledged',
      data: notification
    });

  } catch (error) {
    console.error('Acknowledge Notification Error:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge notification' });
  }
};

/**
 * GET /api/notifications/emergency/unacknowledged
 * Check if user has any unacknowledged emergency notifications
 */
export const getUnacknowledgedEmergencies = async (req, res) => {
  try {
    const studentId = req.user._id;

    const unacknowledged = await NotificationLog.find({
      studentId,
      requiresAcknowledgment: true,
      acknowledgedAt: null
    })
    .select('_id title message referenceId createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    const total = await NotificationLog.countDocuments({
      studentId,
      requiresAcknowledgment: true,
      acknowledgedAt: null
    });

    res.status(200).json({
      success: true,
      count: total,
      notifications: unacknowledged
    });
  } catch (error) {
    console.error('Get Unacknowledged Emergencies Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emergency notifications' });
  }
};

/**
 * GET /api/notifications/stats/acknowledgment/:referenceId
 * Admin/lecturer: Get acknowledgment statistics for a broadcast
 */
export const getAcknowledgmentStats = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const totalSent = await NotificationLog.countDocuments({ referenceId });
    const acknowledged = await NotificationLog.countDocuments({
      referenceId,
      requiresAcknowledgment: true,
      acknowledgedAt: { $ne: null }
    });
    const pending = await NotificationLog.countDocuments({
      referenceId,
      requiresAcknowledgment: true,
      acknowledgedAt: null
    });

    const acknowledgedRate = totalSent > 0 ? ((acknowledged / totalSent) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalSent,
        acknowledged,
        pending,
        acknowledgedRate: `${acknowledgedRate}%`
      }
    });
  } catch (error) {
    console.error('Get Acknowledgment Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch acknowledgment statistics' });
  }
};