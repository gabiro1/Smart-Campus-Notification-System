import express from 'express';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import {
  createStudent, importStudents, getStudents, getStudent,
  updateStudent, suspendStudent, getEnrollmentStats, previewRegNumber
} from '../controllers/registrarController.js';

const router = express.Router();

router.use(protect, authorize('registrar', 'admin'));

router.post('/students', createStudent);
router.post('/students/import', importStudents);
router.get('/students', getStudents);
router.get('/students/stats', getEnrollmentStats);
router.get('/students/preview-reg-number', previewRegNumber);
router.get('/students/:id', getStudent);
router.put('/students/:id', updateStudent);
router.put('/students/:id/toggle-suspend', suspendStudent);

export default router;
