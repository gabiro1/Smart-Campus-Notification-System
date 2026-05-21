import express from 'express';
const router = express.Router();
import { register, login, googleAuth, getProfile, updateProfile, deleteUser, enrollStudent, requestVerification, verifyOTP, resendOTP, forgotPassword, resetPassword, refreshToken, logout, updateNotificationPreferences, completeOnboarding, uploadProfilePhoto, updateLastActive } from '../controller/authController.js';
import { protect, authorize  } from '../../../middleware/authMiddleware.js';
import { validateBody, schemas } from '../../../middleware/validation.js';
import { auditLog } from '../../../middleware/auditMiddleware.js';
import upload from '../../../middleware/uploadMiddleware.js';

// Public auth endpoints with validation
router.post('/register', validateBody(schemas.userRegistration), auditLog('user'), register);
router.post('/login', validateBody(schemas.userLogin), auditLog('user', { customAction: 'LOGIN' }), login);
router.post('/auth/google', auditLog('user', { customAction: 'GOOGLE_AUTH' }), googleAuth);

// OTP verification (replaces old email link verification)
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/request-verification', protect, requestVerification);

// Password reset
router.post('/forgot-password', validateBody(schemas.passwordReset), forgotPassword);
router.put('/reset-password/:token', validateBody(schemas.resetPasswordToken), resetPassword);

// Token refresh & logout
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, auditLog('user', { customAction: 'LOGOUT' }), logout);

// Private routes (Must be logged in)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateBody(schemas.userProfileUpdate), auditLog('user', { captureChanges: true }), updateProfile);
router.post('/profile/photo', protect, upload.single('profilePicture'), uploadProfilePhoto);
router.put('/notification-preferences', protect, updateNotificationPreferences);
router.put('/onboarding', protect, authorize('student'), completeOnboarding);
router.put('/last-active', protect, updateLastActive);
router.delete('/profile', protect, auditLog('user'), deleteUser);

router.post('/enroll', protect, authorize('hod', 'admin'), auditLog('user', { customAction: 'ENROLL_STUDENT' }), enrollStudent);

export default router;