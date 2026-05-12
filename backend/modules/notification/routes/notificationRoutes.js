import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification,
    togglePin,
    toggleMute,
    registerDevice,
    sendNotification,
    getSentHistory,
    getBroadcastStats,
    generateDigest,
    getLatestDigest,
    acknowledgeNotification,
    getUnacknowledgedEmergencies,
    getAcknowledgmentStats
} from '../controllers/notificationController.js';

import { protect, authorize } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// 🔐 GLOBAL PROTECTION
// ==========================================
router.use(protect);

// ==========================================
// 1. STUDENT INBOX & UTILITIES
// ==========================================
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);
router.post('/register-device', registerDevice);

// 🧠 AI Digest
router.get('/digest', generateDigest);
router.get('/digest/latest', getLatestDigest);

// ==========================================
// 2. ADMIN / HOD / LECTURER OPERATIONS
// ==========================================

// 📤 Send Notification
router.post(
    '/dispatch',
    authorize('admin', 'hod', 'lecturer'),
    sendNotification
);

// 📜 Dispatch History
router.get(
    '/dispatch/history',
    authorize('admin', 'hod', 'lecturer'),
    getSentHistory
);

// 📊 Stats (NO COLLISION ANYMORE)

// Broadcast stats
router.get(
    '/stats/broadcast/:referenceId',
    authorize('admin', 'hod', 'lecturer'),
    getBroadcastStats
);

// Acknowledgment stats
router.get(
    '/stats/acknowledgment/:referenceId',
    authorize('admin', 'hod', 'lecturer'),
    getAcknowledgmentStats
);

// ==========================================
// 3. 🚨 EMERGENCY FEATURES
// ==========================================

// Unacknowledged emergency notifications
router.get(
    '/emergency/unacknowledged',
    getUnacknowledgedEmergencies
);

// Acknowledge emergency notification
router.post(
    '/:id/acknowledge',
    acknowledgeNotification
);

// ==========================================
// 4. ⚠️ DYNAMIC ROUTES (MUST BE LAST)
// ==========================================

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Pin / Unpin
router.put('/:id/pin', togglePin);

// Mute / Unmute
router.put('/:id/mute', toggleMute);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;