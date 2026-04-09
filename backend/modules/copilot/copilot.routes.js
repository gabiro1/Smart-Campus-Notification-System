import express from 'express';
import { askCopilot } from './copilot.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/copilot/ask - Protected route
router.post('/ask', protect, askCopilot);

export default router;
