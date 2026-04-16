import express from 'express';
import { sendSMS, testSMS, testSMSMock } from '../controller/smsController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Test SMS endpoint for debugging (Admin only) - uses Twilio
router.post('/test', protect, authorize('admin'), testSMS);

// Send SMS to specific phone number (HOD/Admin)
router.post('/sms', protect, authorize('hod', 'admin'), sendSMS);

// Mock test endpoint - always works without Twilio
router.post('/mock', protect, authorize('admin'), testSMSMock);

export default router;