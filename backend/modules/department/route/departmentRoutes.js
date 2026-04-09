import express from 'express';
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controller/departmentController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), createDepartment) // POST /api/departments
  .get(protect, getDepartments);   // GET /api/departments

router.route('/:id')
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

export default router;