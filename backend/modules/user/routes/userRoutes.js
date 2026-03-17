import express from 'express';
const router = express.Router();
import { register, login, getProfile, updateProfile, deleteUser, enrollStudent } from '../controller/authController.js';
import { protect, authorize  } from '../../../middleware/authMiddleware.js';

router.post('/register', register);
router.post('/login', login);

// Private routes (Must be logged in)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile/:id', protect, deleteUser);

router.post('/enroll', protect, authorize('hod', 'admin'), enrollStudent); // HODs and Admins can enroll students

export default router;