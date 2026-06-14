import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import { authorize } from "../../../middleware/authMiddleware.js";
import {
  askQuestion,
  askQuestionForce,
  getQuestionsForAnnouncement,
  getMyQuestions,
  getLecturerQuestions,
  answerQuestion,
  getUnansweredCount,
} from "../controllers/qaController.js";

const router = express.Router();

router.use(protect);

router.post("/ask", askQuestion);
router.post("/ask-force", askQuestionForce);
router.get("/announcement/:announcementId", getQuestionsForAnnouncement);
router.get("/my-questions", getMyQuestions);
router.get("/lecturer-questions", authorize("lecturer", "hod"), getLecturerQuestions);
router.get("/unanswered-count", authorize("lecturer", "hod"), getUnansweredCount);
router.post("/:id/answer", answerQuestion);

export default router;
