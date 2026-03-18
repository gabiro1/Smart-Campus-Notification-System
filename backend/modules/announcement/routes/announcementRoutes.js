import express from "express";
import { 
  createAnnouncement, 
  getClassAnnouncements, 
  addComment,
  markAsViewed,
  deleteComment,
  getMyAnnouncements
} from "../controller/announcementController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/uploadMiddleware.js"; // Your memoryStorage multer config

const router = express.Router();

// Lecturer Actions
router.post("/create", protect, authorize("lecturer"), upload.array("attachments", 5), createAnnouncement);

// Shared Q&A Feed Actions (Students & Lecturers)
router.get("/class/:classId", protect, getClassAnnouncements);
router.post("/:id/comment", protect, addComment);

// Student Tracking Action
router.post("/:id/view", protect, markAsViewed);

router.post('/create', protect, upload.array('attachments', 5), createAnnouncement);

router.get('/my-feed', protect, getMyAnnouncements);

router.delete("/:id/comment/:commentId", protect, deleteComment);

export default router;