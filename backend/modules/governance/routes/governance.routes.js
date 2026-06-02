/**
 * governance.routes.js
 * ---------------------
 * Routes for the Announcement Governance Engine.
 * All routes are protected by JWT auth middleware.
 */

import express from 'express';
import {
    createGovernanceAnnouncement,
    getPendingAnnouncements,
    reviewAnnouncement,
    getPublishedFeed,
    getMyGovernanceAnnouncements,
    deleteGovernanceAnnouncement,
    updateGovernanceAnnouncement,
} from '../controller/governance.controller.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// ---------------------------------------------------------------
// AUTHORING ROUTES (All authenticated staff roles)
// ---------------------------------------------------------------

// POST /api/governance/announcements  -- Create an announcement
router.post(
    '/',
    protect,
    authorize('lecturer', 'hod', 'dean', 'principal', 'admin', 'hr', 'registrar'),
    createGovernanceAnnouncement
);

// GET /api/governance/announcements/mine  -- Author's own announcements
router.get(
    '/mine',
    protect,
    authorize('lecturer', 'hod', 'dean', 'principal', 'admin', 'hr', 'registrar'),
    getMyGovernanceAnnouncements
);

// ---------------------------------------------------------------
// REVIEWER ROUTES (HoD, Dean, Principal)
// ---------------------------------------------------------------

// GET /api/governance/announcements/pending  -- Inbox for pending announcements
router.get(
    '/pending',
    protect,
    authorize('hod', 'dean', 'principal', 'admin'),
    getPendingAnnouncements
);

// PUT /api/governance/announcements/:id/review  -- Approve or Reject
router.put(
    '/:id/review',
    protect,
    authorize('hod', 'dean', 'principal', 'admin'),
    reviewAnnouncement
);

// ---------------------------------------------------------------
// PUBLIC-FACING ROUTES (All authenticated users)
// ---------------------------------------------------------------

// GET /api/governance/announcements/feed  -- Published feed for all users
router.get(
    '/feed',
    protect,
    getPublishedFeed
);

// ---------------------------------------------------------------
// AUTHOR CRUD ROUTES (Own announcements only)
// ---------------------------------------------------------------

// DELETE /api/governance/announcements/:id  -- Delete own announcement
router.delete(
    '/:id',
    protect,
    authorize('lecturer', 'hod', 'dean', 'principal', 'admin'),
    deleteGovernanceAnnouncement
);

// PUT /api/governance/announcements/:id  -- Update own announcement
router.put(
    '/:id',
    protect,
    authorize('lecturer', 'hod', 'dean', 'principal', 'admin'),
    updateGovernanceAnnouncement
);

export default router;
