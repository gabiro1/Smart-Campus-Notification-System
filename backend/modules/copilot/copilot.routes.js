import express from 'express';
import { askCopilot } from './copilot.controller.js';

const router = express.Router();

// POST /api/copilot/ask
// Public route for now (or require authentication middleware based on your app structure)
router.post('/ask', askCopilot);

export default router;
