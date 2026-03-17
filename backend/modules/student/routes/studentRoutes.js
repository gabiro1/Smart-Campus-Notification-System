import express from 'express';
const router = express.Router();
import { getStudentDashboard } from '../controller/studentController.js';
import { protect } from '../../../middleware/authMiddleware.js';

// The URL becomes: /api/student/dashboard
router.get('/dashboard', protect, getStudentDashboard);

export default router;