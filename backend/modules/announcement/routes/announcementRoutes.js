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
  rescheduleAnnouncement,
  askQuestion,
  getAIAnswer,
  addLecturerReply,
  editQuestion,
  deleteQuestion
} from "../controller/announcementController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/uploadMiddleware.js";
import { validateBody, schemas } from "../../../middleware/validation.js";
import { auditLog } from "../../../middleware/auditMiddleware.js"; 

const router = express.Router();

router.use(protect);

router.get("/lecturer-manage", authorize("lecturer", "hod"), getLecturerAnnouncements);
router.get("/dashboard-stats", authorize("lecturer", "hod"), getLecturerStats);

router.post("/create", authorize("lecturer", "hod"), upload.array("attachments", 5), validateBody(schemas.announcementCreation), auditLog('announcement'), createAnnouncement);

router.patch("/:id", authorize("lecturer", "hod"), validateBody(schemas.announcementUpdate), auditLog('announcement', { captureChanges: true }), updateAnnouncement);
router.delete("/:id", authorize("lecturer", "hod"), auditLog('announcement'), deleteAnnouncement);

router.get("/scheduled", authorize("lecturer", "hod"), getScheduledAnnouncements);
router.delete("/scheduled/:id/cancel", authorize("lecturer", "hod"), cancelScheduledAnnouncement);
router.patch("/scheduled/:id/reschedule", authorize("lecturer", "hod"), rescheduleAnnouncement);

router.get("/my-feed", getMyAnnouncements);
router.get("/class/:classId", getClassAnnouncements);

router.patch("/:id/view", markAsViewed);

router.post("/:id/comment", addComment);
router.patch("/:id/comment/:commentId", updateComment);
router.delete("/:id/comment/:commentId", deleteComment);

// Q&A Routes
router.post("/:id/question", askQuestion);
router.patch("/:id/question/:questionId", editQuestion);
router.delete("/:id/question/:questionId", deleteQuestion);
router.post("/:id/question/:questionId/ai-answer", getAIAnswer);
router.post("/:id/question/:questionId/reply", authorize("lecturer", "hod"), addLecturerReply);

export default router;