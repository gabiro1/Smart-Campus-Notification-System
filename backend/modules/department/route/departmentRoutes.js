import express from 'express';
import { createDepartment, getDepartments } from '../controller/departmentController.js';

const router = express.Router();

router.route('/')
  .post(createDepartment) // POST /api/departments
  .get(getDepartments);   // GET /api/departments

export default router;