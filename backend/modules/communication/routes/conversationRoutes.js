import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  getUnreadSummary,
  searchConversations
} from "../controller/conversationController.js";

const router = express.Router();

router.get("/", protect, getConversations);
router.post("/", protect, createConversation);
router.get("/unread-summary", protect, getUnreadSummary);
router.get("/search", protect, searchConversations);
router.get("/:id", protect, getConversation);
router.patch("/:id", protect, updateConversation);

export default router;
