import express from 'express';
import { suggestAnnouncement, paraphraseText, summarizeAnnouncement, improveText, detectPriority } from '../controller/aiController.js';
import { protect } from '../../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/ai/suggest-announcement
 * Generates a professional academic announcement from raw draft text.
 * Accessible to all authenticated users.
 */
router.post('/suggest-announcement', protect, suggestAnnouncement);

/**
 * POST /api/ai/paraphrase
 * Paraphrases and polishes text for broadcast communications.
 * Accessible to all authenticated users.
 */
router.post('/paraphrase', protect, paraphraseText);

/**
 * POST /api/ai/summarize
 * Summarizes a long announcement into 1-2 concise sentences.
 * Accessible to all authenticated users.
 */
router.post('/summarize', protect, summarizeAnnouncement);

/**
 * POST /api/ai/improve
 * Improves grammar, spelling, and clarity while preserving the original message.
 * Accessible to all authenticated users.
 */
router.post('/improve', protect, improveText);

/**
 * POST /api/ai/detect-priority
 * Analyzes announcement content and detects priority level.
 * Accessible to all authenticated users.
 */
router.post('/detect-priority', protect, detectPriority);

export default router;
