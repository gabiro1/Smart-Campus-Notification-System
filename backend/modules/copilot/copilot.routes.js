import express from 'express';
import { askCopilot, askAnnouncementQuestion } from './copilot.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ask', protect, askCopilot);
router.post('/ask-announcement', protect, askAnnouncementQuestion);

export default router;
