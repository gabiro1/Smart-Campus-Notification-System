import express from 'express';
const router = express.Router();
import { register, login, getProfile, updateProfile, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', register);
router.post('/login', login);

// Private routes (Must be logged in)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile/:id', protect, deleteUser);

export default router;