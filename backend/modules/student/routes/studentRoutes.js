import express from 'express';
const router = express.Router();
import { getStudentDashboard, getStudentTimetable, getStudentStats, getClassmates } from '../controller/studentController.js';
import { protect } from '../../../middleware/authMiddleware.js';

// The URL becomes: /api/student/dashboard
router.get('/dashboard', protect, getStudentDashboard);

// Student timetable endpoint - fetches timetable for student's class
router.get('/timetable', protect, getStudentTimetable);

// Student stats endpoint - fetches dashboard statistics
router.get('/stats', protect, getStudentStats);

// Student classmates endpoint - fetches classmates in same class
router.get('/classmates', protect, getClassmates);

export default router;