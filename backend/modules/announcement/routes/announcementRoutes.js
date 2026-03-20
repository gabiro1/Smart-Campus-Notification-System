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
  deleteAnnouncement // <--- YOU MUST IMPORT THIS FROM YOUR CONTROLLER
} from "../controller/announcementController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/uploadMiddleware.js"; 

const router = express.Router();

// ==========================================
// LECTURER DASHBOARD ROUTES
// ==========================================
router.get("/lecturer-manage", protect, authorize("lecturer"), getLecturerAnnouncements);
router.post("/create", protect, authorize("lecturer"), upload.array("attachments", 5), createAnnouncement);
router.delete("/:id", protect, authorize("lecturer"), deleteAnnouncement); // <--- ADDED THE MISSING ROUTE
router.get("/dashboard-stats", protect, authorize("lecturer"), getLecturerStats);

// ==========================================
// STUDENT FEED ROUTES
// ==========================================
router.get("/my-feed", protect, getMyAnnouncements);
router.patch("/:id", protect, authorize("lecturer"), updateAnnouncement);

// ==========================================
// SHARED ROUTES (Both can view & comment)
// ==========================================
router.get("/class/:classId", protect, getClassAnnouncements);
router.post("/:id/comment", protect, addComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);
router.post("/:id/view", protect, markAsViewed);
router.patch("/:id/comment/:commentId", protect, updateComment);

export default router;