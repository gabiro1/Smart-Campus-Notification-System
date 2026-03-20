import express from 'express';
import { sendSMS } from '../controller/smsController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sms', protect, authorize('hod', 'admin'), sendSMS);

export default router;