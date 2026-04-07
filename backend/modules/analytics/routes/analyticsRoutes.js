import express from "express";
import {
  getAnnouncementAnalytics,
  getAnnouncementRecipientDetails
} from "../controller/analyticsController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// ==========================================
// ANNOUNCEMENT ANALYTICS
// ==========================================

// GET /api/analytics/announcements/:id
// Returns aggregated stats for an announcement (totalSent, delivered, read, unread, rates)
router.get("/announcements/:id", getAnnouncementAnalytics);

// GET /api/analytics/announcements/:id/recipients
// Returns detailed per-student breakdown (for HOD/Dean drill-down)
router.get("/announcements/:id/recipients", authorize('hod', 'dean', 'admin'), getAnnouncementRecipientDetails);

export default router;
