import express from 'express';
const router = express.Router();
import { register, login, getProfile, updateProfile, deleteUser, enrollStudent, requestVerification, verifyEmail, forgotPassword, resetPassword, refreshToken, logout, updateNotificationPreferences, completeOnboarding } from '../controller/authController.js';
import { protect, authorize  } from '../../../middleware/authMiddleware.js';
import { validateBody, schemas } from '../../../middleware/validation.js';
import { auditLog } from '../../../middleware/auditMiddleware.js';

// Public auth endpoints with validation
router.post('/register', validateBody(schemas.userRegistration), auditLog('user'), register);
router.post('/login', validateBody(schemas.userLogin), auditLog('user', { customAction: 'LOGIN' }), login);

// Email verification
router.post('/request-verification', protect, requestVerification);
router.get('/verify-email/:token', verifyEmail);

// Password reset
router.post('/forgot-password', validateBody(schemas.passwordReset), forgotPassword);
router.put('/reset-password/:token', validateBody(schemas.resetPasswordToken), resetPassword);

// Token refresh & logout
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, auditLog('user', { customAction: 'LOGOUT' }), logout);

// Private routes (Must be logged in)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateBody(schemas.userProfileUpdate), auditLog('user', { captureChanges: true }), updateProfile);
router.put('/notification-preferences', protect, updateNotificationPreferences);
router.put('/onboarding', protect, authorize('student'), completeOnboarding);
router.delete('/profile/:id', protect, auditLog('user'), deleteUser);

router.post('/enroll', protect, authorize('hod', 'admin'), auditLog('user', { customAction: 'ENROLL_STUDENT' }), enrollStudent); // HODs and Admins can enroll students

export default router;