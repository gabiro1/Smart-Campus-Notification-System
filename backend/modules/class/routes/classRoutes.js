import express from 'express';
import { 
  createClass, 
  getClasses, 
  assignLecturers, 
  getLecturers,
  assignClassToLecturer,
  removeClassFromLecturer,
  updateLecturerInfo,
  getMyClasses,
  getClassStudents,
  updateClass,
  deleteClass
} from '../controller/classController.js';

import { protect, authorize } from '../../../middleware/authMiddleware.js'; 

const router = express.Router();

// ==========================================
// STATIC ROUTES (Must come BEFORE dynamic /:id routes)
// ==========================================

// --- LECTURER & HOD ROUTES ---
router.get('/my-classes', protect, authorize('lecturer', 'hod'), getMyClasses);

// --- HOD / ADMIN ROUTES ---
router.get('/lecturers', protect, authorize('hod', 'admin'), getLecturers);

// ==========================================
// DYNAMIC ROUTES
// ==========================================

// --- MIXED/GENERAL CLASSES ROUTES ---
router.route('/')
  .get(protect, getClasses)
  .post(protect, authorize('hod', 'admin'), createClass);

// --- UPDATE/DELETE CLASS ---
router.route('/:id')
  .put(protect, authorize('hod', 'admin'), updateClass)
  .delete(protect, authorize('hod', 'admin'), deleteClass);

// --- LECTURER SPECIFIC DYNAMIC ROUTES ---
router.get('/:classId/students', protect, authorize('lecturer'), getClassStudents);

// --- HOD / STAFF MANAGEMENT ROUTES ---
router.route('/lecturer/:id')
  .put(protect, authorize('hod', 'admin'), updateLecturerInfo);

router.route('/assign/:lecturerId')
  .post(protect, authorize('hod', 'admin'), assignClassToLecturer);

router.route('/remove/:lecturerId/:classId')
  .delete(protect, authorize('hod', 'admin'), removeClassFromLecturer);

router.route('/:classId/assign-multiple')
  .put(protect, authorize('hod', 'admin'), assignLecturers);

export default router;