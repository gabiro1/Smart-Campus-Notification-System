import express from 'express';
const router = express.Router();
import {
    markAsRead,
    getEventStats,
    getAIInsights,
    getNotifications,
    getNotificationDetails,
    markAllAsRead,
    deleteNotification,
    getNotificationSummary,
    getUnreadCount
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Get all notifications for current user (paginated)
router.get('/', protect, getNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Get notification summary
router.get('/summary', protect, getNotificationSummary);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Search & get specific notification details
router.get('/:id', protect, getNotificationDetails);

// Delete a specific notification
router.delete('/:id', protect, deleteNotification);

// Student marks a message as read
router.put('/read/:eventId', protect, markAsRead);

// Admin checks how many students saw the message
router.get('/stats/:eventId', protect, authorize('admin', 'guild'), getEventStats);

// AI Dashboard for School Management
router.get('/insights', protect, authorize('admin'), getAIInsights);

export default router;