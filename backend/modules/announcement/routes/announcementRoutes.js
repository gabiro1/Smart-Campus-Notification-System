import express from "express";
import { 
  createAnnouncement, 
  getClassAnnouncements, 
  addComment,
  markAsViewed
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

export default router;