import express from 'express';
import { createSchool, getSchools } from '../controller/schoolController.js';

const router = express.Router();

router.route('/')
  .post(createSchool) // POST /api/schools
  .get(getSchools);   // GET /api/schools

export default router;