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
  getClassStudents 
} from '../controller/classController.js';

// IMPORTANT: You need your auth middleware here to populate req.user 
// and restrict access based on roles.
import { protect, authorize } from '../../../middleware/authMiddleware.js'; 

const router = express.Router();

// ==========================================
// STATIC ROUTES (Must come BEFORE dynamic /:id routes)
// ==========================================

// --- LECTURER ROUTES ---
// Requires standard login (Lecturer role)
router.get('/my-classes', protect, authorize('lecturer'), getMyClasses);

// --- HOD / ADMIN ROUTES ---
// Requires Admin/HOD privileges
router.get('/lecturers', protect, authorize('hod', 'admin'), getLecturers);

// ==========================================
// DYNAMIC ROUTES (Containing parameters like :id)
// ==========================================

// --- MIXED/GENERAL CLASSES ROUTES ---
router.route('/')
  .get(protect, getClasses) // Maybe all logged-in users can view classes? Adjust auth as needed.
  .post(protect, authorize('hod', 'admin'), createClass);

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