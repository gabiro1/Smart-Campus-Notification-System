import express from 'express';
import { createSchool, getSchools, updateSchool, deleteSchool } from '../controller/schoolController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), createSchool) // POST /api/schools
  .get(protect, getSchools);   // GET /api/schools

router.route('/:id')
  .put(protect, authorize('admin'), updateSchool)
  .delete(protect, authorize('admin'), deleteSchool);

export default router;