import express from 'express';
import { createCollege, getColleges, updateCollege, deleteCollege } from '../controller/collegeController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), createCollege) // POST /api/colleges
  .get(protect, getColleges);   // GET /api/colleges

router.route('/:id')
  .put(protect, authorize('admin', 'principal'), updateCollege)
  .delete(protect, authorize('admin'), deleteCollege);

export default router;