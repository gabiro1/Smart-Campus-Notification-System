import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    registerDevice,
    sendNotification,      // NEW: Admin dispatch
    getSentHistory,        // NEW: Admin dispatch history
    getBroadcastStats,     // NEW: Replaced getEventStats
    generateDigest,        // NEW: AI Digest
    getLatestDigest,       // NEW: Get cached digest
    acknowledgeNotification, // NEW: Emergency acknowledgment
    getUnacknowledgedEmergencies, // NEW: Check for emergencies
    getAcknowledgmentStats // NEW: Admin analytics
} from '../controllers/notificationController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Apply base authentication to ALL routes
router.use(protect);

// ==========================================
// 1. STUDENT INBOX & UTILITIES
// ==========================================
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);
router.post('/register-device', registerDevice);
// AI Digest
router.get('/digest', generateDigest);
router.get('/digest/latest', getLatestDigest);

// ==========================================
// 2. ADMIN & HOD DISPATCH (Protected Roles)
// ==========================================
// Assuming 'admin' and 'hod' are your elevated roles. Adjust if needed.
router.post('/dispatch', authorize('admin', 'hod', 'lecturer'), sendNotification);
router.get('/dispatch/history', authorize('admin', 'hod', 'lecturer'), getSentHistory);
router.get('/stats/:referenceId', authorize('admin', 'hod', 'lecturer'), getBroadcastStats);

// ==========================================
// 3. DYNAMIC ROUTES (Must stay at the bottom)
// ==========================================
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Emergency acknowledgment
router.post('/:id/acknowledge', acknowledgeNotification);
router.get('/emergency/unacknowledged', getUnacknowledgedEmergencies);

// Admin analytics
router.get('/stats/acknowledgment/:referenceId', authorize('admin', 'hod', 'lecturer'), getAcknowledgmentStats);

export default router;