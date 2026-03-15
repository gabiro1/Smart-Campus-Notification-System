import express from 'express';
import { createCollege, getColleges } from '../controller/collegeController.js';

const router = express.Router();

router.route('/')
  .post(createCollege) // POST /api/colleges
  .get(getColleges);   // GET /api/colleges

export default router;