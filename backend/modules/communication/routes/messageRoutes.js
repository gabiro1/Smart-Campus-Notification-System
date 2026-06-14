import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/uploadMiddleware.js";
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  editMessage,
  voteOnPoll,
  flagMessage
} from "../controller/messageController.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), sendMessage);
router.get("/:threadId", protect, getMessages);
router.patch("/read", protect, markAsRead);
router.put("/:id/vote", protect, voteOnPoll);
router.post("/:id/flag", protect, flagMessage);
router.put("/:id", protect, editMessage);
router.delete("/:id", protect, deleteMessage);

export default router;
