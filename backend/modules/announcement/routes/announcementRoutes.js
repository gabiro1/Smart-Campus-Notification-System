import express from "express";
import { 
  createAnnouncement, 
  getClassAnnouncements, 
  addComment 
} from "../controller/announcementController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Lecturer routes
router.post("/create", protect, authorize("lecturer"), createAnnouncement);

// Shared routes (Students and Lecturers can view and comment)
router.get("/class/:classId", protect, getClassAnnouncements);
router.post("/:id/comment", protect, addComment);

export default router;