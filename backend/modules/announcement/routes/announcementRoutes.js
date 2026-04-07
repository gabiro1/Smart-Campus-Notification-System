import express from "express";
import {
  createAnnouncement,
  getClassAnnouncements,
  addComment,
  getLecturerAnnouncements,
  markAsViewed,
  deleteComment,
  updateAnnouncement,
  getLecturerStats,
  updateComment,
  getMyAnnouncements,
  deleteAnnouncement,
  getScheduledAnnouncements,
  cancelScheduledAnnouncement,
  rescheduleAnnouncement
} from "../controller/announcementController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
// Adjust this path if your upload middleware is located elsewhere
import upload from "../../../middleware/uploadMiddleware.js";
import { validateBody, schemas } from "../../../middleware/validation.js";
import { auditLog } from "../../../middleware/auditMiddleware.js"; 

const router = express.Router();

// Apply base authentication to ALL routes
router.use(protect);

// ==========================================
// 1. LECTURER DASHBOARD ROUTES
// ==========================================
router.get("/lecturer-manage", authorize("lecturer"), getLecturerAnnouncements);
router.get("/dashboard-stats", authorize("lecturer"), getLecturerStats);

// Create Announcement (Accepts up to 5 file attachments)
router.post("/create", authorize("lecturer"), upload.array("attachments", 5), validateBody(schemas.announcementCreation), auditLog('announcement'), createAnnouncement);

// Edit and Delete Announcements
router.patch("/:id", authorize("lecturer"), validateBody(schemas.announcementUpdate), auditLog('announcement', { captureChanges: true }), updateAnnouncement);
router.delete("/:id", authorize("lecturer"), auditLog('announcement'), deleteAnnouncement);

// Scheduled Announcements Management
router.get("/scheduled", authorize("lecturer"), getScheduledAnnouncements);
router.delete("/scheduled/:id/cancel", authorize("lecturer"), cancelScheduledAnnouncement);
router.patch("/scheduled/:id/reschedule", authorize("lecturer"), rescheduleAnnouncement);

// ==========================================
// 2. STUDENT FEED ROUTES
// ==========================================
// Fetches the specific feed for the logged-in student's class
router.get("/my-feed", getMyAnnouncements);

// Fetches a feed for a specific class ID (used if a user can view multiple classes)
router.get("/class/:classId", getClassAnnouncements);

// ==========================================
// 3. INTERACTIVITY (Shared: Views & Comments)
// ==========================================
// Record a view (Read Receipt)
router.patch("/:id/view", markAsViewed);

// Comment CRUD
router.post("/:id/comment", addComment);
router.patch("/:id/comment/:commentId", updateComment);
router.delete("/:id/comment/:commentId", deleteComment);

export default router;