/**
 * governance.controller.js
 * -------------------------
 * Controllers for the Announcement Governance Engine.
 * 
 * POST   /api/governance/announcements          → createGovernanceAnnouncement
 * GET    /api/governance/announcements/pending  → getPendingAnnouncements
 * PUT    /api/governance/announcements/:id/review → reviewAnnouncement
 * GET    /api/governance/announcements/feed     → getPublishedFeed (for all users)
 */

import GovernanceAnnouncement from '../model/GovernanceAnnouncement.js';
import { determineApprovalFlow } from '../utils/approvalFlow.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import User from '../../user/model/User.js';
import nodemailer from 'nodemailer';

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

// --- DISPATCH ANNOUNCEMENT TO USERS ---
const dispatchAnnouncement = async (announcement) => {
    try {
        console.log('[Dispatch] Starting notification dispatch for announcement:', announcement._id);
        
        // Build user query based on targetScope
        // Default: get all active users (college-wide)
        let userQuery = { isActive: { $ne: false } };
        
        if (announcement.departmentId) {
            userQuery.department = announcement.departmentId;
        } else if (announcement.schoolId) {
            userQuery.school = announcement.schoolId;
        } else if (announcement.collegeId) {
            userQuery.college = announcement.collegeId;
        }
        // If no scope IDs are set, userQuery remains { isActive: { $ne: false } } - gets all active users
        
        const users = await User.find(userQuery).select('_id email name fcmToken phoneNumber notificationPreferences');
        console.log('[Dispatch] Found', users.length, 'target users');
        
        if (users.length === 0) {
            console.log('[Dispatch] No users found for target scope');
            return { success: true, notified: 0 };
        }
        
        // Map priority for notification
        const priorityMap = { high: 'high', medium: 'medium', low: 'low' };
        const notificationPriority = priorityMap[announcement.priority] || 'medium';
        
        const results = await Promise.allSettled(
            users.map(async (user) => {
                try {
                    // Create notification log
                    const notification = await NotificationLog.create({
                        studentId: user._id,
                        recipientId: user._id,
                        senderId: announcement.authorId,
                        title: announcement.title,
                        message: announcement.content,
                        status: 'unread',
                        type: 'announcement',
                        priority: notificationPriority,
                        referenceId: announcement._id,
                        referenceType: 'governance_announcement'
                    });
                    
                    // Send email if enabled
                    const prefs = user.notificationPreferences || {};
                    if (prefs.email !== false && user.email) {
                        try {
                            const transporter = getTransporter();
                            await transporter.sendMail({
                                from: `"UniNotify" <${process.env.EMAIL_USER}>`,
                                to: user.email,
                                subject: announcement.title,
                                html: `<div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #1e40af;">${announcement.title}</h2>
                                    <p>Dear <strong>${user.name}</strong>,</p>
                                    <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e40af; color: #1e293b; margin: 15px 0;">
                                        ${announcement.content.replace(/\n/g, '<br>')}
                                    </div>
                                    <p style="color: #666; font-size: 12px;">
                                        — ${announcement.authorName || 'University Administration'}
                                    </p>
                                </div>`,
                            });
                        } catch (emailErr) {
                            console.warn('[Dispatch] Email failed for user', user._id, emailErr.message);
                        }
                    }
                    
                    return notification;
                } catch (userErr) {
                    console.warn('[Dispatch] Failed to notify user', user._id, userErr.message);
                    return null;
                }
            })
        );
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log('[Dispatch] Successfully notified', successful, 'users');
        
        return { success: true, notified: successful };
    } catch (error) {
        console.error('[Dispatch] Error dispatching announcement:', error);
        return { success: false, error: error.message };
    }
};

// ============================================================
// CONTROLLER 1: Create an Announcement
// POST /api/governance/announcements
// ============================================================
export const createGovernanceAnnouncement = async (req, res) => {
    try {
        const { title, content, priority, targetScope, departmentId, schoolId, collegeId } = req.body;

        // The author's role comes from the verified JWT token
        const authorRole = req.user.role;
        const authorId   = req.user._id;
        const authorName = req.user.name;

        // Apply the escalation matrix
        const { status, pendingApprovalFromRole } = determineApprovalFlow(authorRole, targetScope);

        const newAnnouncement = await GovernanceAnnouncement.create({
            title,
            content,
            priority: priority || 'medium',
            targetScope,
            status,
            pendingApprovalFromRole,
            authorId,
            authorRole,
            authorName,
            departmentId: departmentId || null,
            schoolId: schoolId || null,
            collegeId: collegeId || null, // null = college-wide (all users)
        });

        // If published immediately (principal/admin), dispatch notifications
        if (status === 'published') {
            await dispatchAnnouncement(newAnnouncement);
        }

        const message =
            status === 'published'
                ? 'Announcement published and notifications sent successfully!'
                : `Announcement submitted for ${pendingApprovalFromRole?.toUpperCase()} approval.`;

        return res.status(201).json({
            success: true,
            message,
            data: newAnnouncement,
        });

    } catch (error) {
        // Deliberate denial errors (from the governance matrix) → 403
        if (error.message.includes('cannot publish') || error.message.includes('must escalate')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        console.error('createGovernanceAnnouncement:', error);
        return res.status(500).json({ success: false, message: 'Server error. Could not create announcement.' });
    }
};

// ============================================================
// CONTROLLER 2: Get Pending Announcements for Review
// GET /api/governance/announcements/pending
// (HoD, Dean, Principal only)
// ============================================================
export const getPendingAnnouncements = async (req, res) => {
    try {
        const reviewerRole = req.user.role;

        // Only authorised reviewers can access this endpoint
        const validReviewers = ['hod', 'dean', 'principal', 'admin'];
        if (!validReviewers.includes(reviewerRole)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to review announcements.' });
        }

        // Return announcements where pendingApprovalFromRole matches the requester's role
        const pending = await GovernanceAnnouncement.find({
            status: 'pending',
            pendingApprovalFromRole: reviewerRole === 'admin' ? { $exists: true } : reviewerRole,
        })
        .populate('authorId', 'name email profilePicture')
        .populate('departmentId', 'name code')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: pending.length,
            data: pending,
        });

    } catch (error) {
        console.error('getPendingAnnouncements:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching pending announcements.' });
    }
};

// ============================================================
// CONTROLLER 3: Approve or Reject an Announcement
// PUT /api/governance/announcements/:id/review
// ============================================================
export const reviewAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
        const reviewerRole = req.user.role;

        const announcement = await GovernanceAnnouncement.findById(id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        // Ensure only the correct role can review
        if (announcement.pendingApprovalFromRole !== reviewerRole && reviewerRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `This announcement requires ${announcement.pendingApprovalFromRole?.toUpperCase()} approval, not ${reviewerRole?.toUpperCase()}.`,
            });
        }

        if (announcement.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Announcement is already ${announcement.status}.` });
        }

        if (action === 'approve') {
            announcement.status                = 'published';
            announcement.pendingApprovalFromRole = null;
            announcement.reviewedBy            = req.user._id;
            announcement.reviewedAt            = new Date();
            
            // Dispatch notifications to target users
            await dispatchAnnouncement(announcement);
        } else if (action === 'reject') {
            if (!rejectionReason?.trim()) {
                return res.status(400).json({ success: false, message: 'A rejection reason is required.' });
            }
            announcement.status          = 'rejected';
            announcement.rejectionReason = rejectionReason.trim();
            announcement.reviewedBy      = req.user._id;
            announcement.reviewedAt      = new Date();
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject".' });
        }

        await announcement.save();

        return res.status(200).json({
            success: true,
            message: `Announcement ${action === 'approve' ? 'approved and published' : 'rejected'} successfully.`,
            data: announcement,
        });

    } catch (error) {
        console.error('reviewAnnouncement:', error);
        return res.status(500).json({ success: false, message: 'Server error during review.' });
    }
};

// ============================================================
// CONTROLLER 4: Get Published Feed (All Users)
// GET /api/governance/announcements/feed
// ============================================================
export const getPublishedFeed = async (req, res) => {
    try {
        const userRole = req.user.role;

        // Students see everything published; others see what's relevant to their scope
        const published = await GovernanceAnnouncement.find({ status: 'published' })
            .populate('authorId', 'name email profilePicture role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: published.length,
            data: published,
        });
    } catch (error) {
        console.error('getPublishedFeed:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching feed.' });
    }
};

// ============================================================
// CONTROLLER 5: Get My Own Announcements (for the author)
// GET /api/governance/announcements/mine
// ============================================================
export const getMyGovernanceAnnouncements = async (req, res) => {
    try {
        const mine = await GovernanceAnnouncement.find({ authorId: req.user._id })
            .populate('departmentId', 'name code')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: mine });
    } catch (error) {
        console.error('getMyGovernanceAnnouncements:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================================
// CONTROLLER 6: Delete Own Announcement
// DELETE /api/governance/announcements/:id
// ============================================================
export const deleteGovernanceAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        
        const announcement = await GovernanceAnnouncement.findById(id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        // Only the author can delete their own announcement
        if (announcement.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own announcements.' });
        }

        // Prevent deleting published announcements
        if (announcement.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot delete published announcements.' });
        }

        await GovernanceAnnouncement.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: 'Announcement deleted successfully.' });
    } catch (error) {
        console.error('deleteGovernanceAnnouncement:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================================
// CONTROLLER 7: Update Own Announcement
// PUT /api/governance/announcements/:id
// ============================================================
export const updateGovernanceAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, priority, targetScope, departmentId, schoolId, collegeId } = req.body;
        
        const announcement = await GovernanceAnnouncement.findById(id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        // Only the author can update their own announcement
        if (announcement.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own announcements.' });
        }

        // Prevent editing published announcements
        if (announcement.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot edit published announcements.' });
        }

        // Update fields
        if (title) announcement.title = title;
        if (content) announcement.content = content;
        if (priority) announcement.priority = priority;
        if (targetScope) {
            announcement.targetScope = targetScope;
            // Re-determine approval flow if scope changed
            const { status, pendingApprovalFromRole } = determineApprovalFlow(req.user.role, targetScope);
            announcement.status = status;
            announcement.pendingApprovalFromRole = pendingApprovalFromRole;
        }
        if (departmentId) announcement.departmentId = departmentId;
        if (schoolId) announcement.schoolId = schoolId;
        if (collegeId) announcement.collegeId = collegeId;

        await announcement.save();

        return res.status(200).json({ success: true, message: 'Announcement updated.', data: announcement });
    } catch (error) {
        console.error('updateGovernanceAnnouncement:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
