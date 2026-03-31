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
            schoolId:     schoolId     || null,
            collegeId:    collegeId    || null,
        });

        const message =
            status === 'published'
                ? 'Announcement published successfully!'
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
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: mine });
    } catch (error) {
        console.error('getMyGovernanceAnnouncements:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
