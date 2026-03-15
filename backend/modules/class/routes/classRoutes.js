import express from 'express';
import { 
  createClass, 
  getClasses, 
  assignLecturers, 
  getLecturers,
  assignClassToLecturer,
  removeClassFromLecturer,
  updateLecturerInfo,
  getMyClasses 
} from '../controller/classController.js';

// Assuming you have an auth middleware to protect these routes
// import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// --- GENERAL / MIXED ROUTES ---
router.route('/')
  .get(getClasses)   // GET /api/classes
  .post(createClass); // POST /api/classes

// --- LECTURER DASHBOARD ---
// This route should come BEFORE /:id routes to avoid being treated as an ID
router.get('/my-classes', getMyClasses); 

// --- HOD DASHBOARD / STAFF MANAGEMENT ---
router.get('/lecturers', getLecturers);

router.route('/lecturer/:id')
  .put(updateLecturerInfo); // Update specific lecturer details

router.route('/assign/:lecturerId')
  .post(assignClassToLecturer); // Link a class to a lecturer

router.route('/remove/:lecturerId/:classId')
  .delete(removeClassFromLecturer); // Unlink a lecturer from a class

router.route('/:classId/assign-multiple')
  .put(assignLecturers); // Bulk assign lecturers to a class

export default router;