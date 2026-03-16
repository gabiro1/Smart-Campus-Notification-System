import express from 'express';
import { createCourse, getMyCourses } from '../controllers/courseController.js';
// 1. Import BOTH bouncers from your middleware
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// 2. THE LOCKDOWN: You MUST be logged in (protect) AND be an HOD or Admin (authorize)
router.post('/', protect, authorize('hod', 'admin'), createCourse);

// 3. GET MY COURSES: You must be logged in, and be a Lecturer, HOD, or Admin
router.get('/my-courses', protect, authorize('lecturer', 'hod', 'admin'), getMyCourses);

export default router;