import express from "express";
import { sendMessage, getMessages, getContacts, voteOnPoll } from "../controller/messageController.js";
import { protect } from "../../../middleware/authMiddleware.js"; 
import upload from "../../../middleware/uploadMiddleware.js"; 

const router = express.Router();

// All messaging routes require the user to be logged in
router.use(protect);

/**
 * @route   GET /api/messages/contacts
 * @desc    Fetch allowed people to message (filtered by role/security)
 */
router.get("/contacts", getContacts);

/**
 * @route   POST /api/messages
 * @desc    Send a rich message (Text + Optional File)
 * @logic   upload.single('file') intercepts the file before it hits the controller
 */
router.post("/", upload.single('file'), sendMessage);

/**
 * @route   GET /api/messages/:otherUserId
 * @desc    Get the private chat history with a specific person
 */
router.get("/:otherUserId", getMessages);
router.put("/:messageId/vote", voteOnPoll);

export default router;