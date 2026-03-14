import express from 'express';
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount, 
    deleteNotification,
    getNotificationDetails,
    getNotificationSummary,
    getEventStats,
    getAIInsights
} from '../controllers/notificationController.js';
import { protect } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(protect);

// ----------------------------------------------------
// STATIC ROUTES (Must come before /:id routes)
// ----------------------------------------------------
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/summary', getNotificationSummary);
router.get('/insights', getAIInsights);
router.put('/mark-all-read', markAllAsRead);

// ----------------------------------------------------
// DYNAMIC ROUTES (With parameters)
// ----------------------------------------------------
router.get('/stats/:eventId', getEventStats);
router.get('/:id', getNotificationDetails);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;