import express from 'express';
import { createCourse, getMyCourses, getAllCourses, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Admin: Get all courses
router.get('/', protect, authorize('admin', 'principal'), getAllCourses);

// Create course (admin/hod)
router.post('/', protect, authorize('hod', 'admin', 'principal'), createCourse);

// Update course (admin/hod)
router.put('/:id', protect, authorize('hod', 'admin', 'principal'), updateCourse);

// Delete course (admin only)
router.delete('/:id', protect, authorize('admin', 'principal'), deleteCourse);

// Get my courses (lecturer)
router.get('/my-courses', protect, authorize('lecturer', 'hod', 'admin', 'principal'), getMyCourses);

export default router;