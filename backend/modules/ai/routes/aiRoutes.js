import express from 'express';
import { suggestAnnouncement } from '../controller/aiController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/ai/suggest-announcement
 * Generates a professional academic announcement from raw draft text.
 * Accessible to authenticated lecturers, admins, HODs, deans, principals, and class reps.
 */
router.post('/suggest-announcement', protect, authorize('lecturer', 'admin', 'hod', 'dean', 'principal', 'class_rep'), suggestAnnouncement);

export default router;
