import express from "express";
import { sendMessage, getMessages, getContacts, voteOnPoll, getConversations } from "../controller/messageController.js";
// 1. ADD getSentHistory to your imports here
import { sendNotification, getSentHistory } from "../../notification/controllers/notificationController.js"; 
import { protect, authorize } from "../../../middleware/authMiddleware.js"; 
import upload from "../../../middleware/uploadMiddleware.js"; 

const router = express.Router();

// All messaging routes require the user to be logged in
router.use(protect);

/**
 * @route   GET /api/messages/contacts
 */
router.get("/contacts", getContacts);

/**
 * @route   GET /api/messages/history
 * @desc    Fetch HOD's sent notification logs
 * 🛡️ CRITICAL: Must be placed BEFORE /:otherUserId
 */
router.get("/history", authorize('hod', 'admin'), getSentHistory);

/**
 * @route   POST /api/messages/notify
 * @desc    Send Omnichannel Notification
 */
router.post("/notify", authorize('hod', 'admin'), sendNotification);

/**
 * @route   GET /api/messages/conversations
 */
router.get("/conversations", getConversations);

/**
 * @route   POST /api/messages
 */
router.post("/", upload.single('file'), sendMessage);

/**
 * @route   GET /api/messages/:otherUserId
 * @desc    Catch-all for direct messages
 */
router.get("/:otherUserId", getMessages);

router.put("/:messageId/vote", voteOnPoll);

export default router;