import express from 'express';
const router = express.Router();
import {
    getDashboardMetrics,
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    promoteUser,
    getAnalytics,
    getAuditLogs,
    getBroadcastHistory,
    getEventMonitor,
    getDepartmentStats,
    getEngagementByDepartment
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

/**
 * @route   GET /api/admin/metrics
 * @desc    Get dashboard metrics
 * @access  Private (Admin only)
 */
router.get('/metrics', getDashboardMetrics);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin only)
 */
router.get('/users', getUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get single user details
 * @access  Private (Admin only)
 */
router.get('/users/:userId', getUser);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user details
 * @access  Private (Admin only)
 */
router.put('/users/:userId', updateUser);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user account
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', deleteUser);

/**
 * @route   POST /api/admin/users/:userId/promote
 * @desc    Promote user role
 * @access  Private (Admin only)
 */
router.post('/users/:userId/promote', promoteUser);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Private (Admin only)
 */
router.get('/analytics', getAnalytics);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private (Admin only)
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @route   GET /api/admin/broadcasts
 * @desc    Get broadcast history
 * @access  Private (Admin only)
 */
router.get('/broadcasts', getBroadcastHistory);

/**
 * @route   GET /api/admin/event-monitor
 * @desc    Get event monitor (real-time tracking)
 * @access  Private (Admin only)
 */
router.get('/event-monitor', getEventMonitor);

/**
 * @route   GET /api/admin/departments-stats
 * @desc    Get department statistics
 * @access  Private (Admin only)
 */
router.get('/departments-stats', getDepartmentStats);

/**
 * @route   GET /api/admin/engagement
 * @desc    Get engagement by department
 * @access  Private (Admin only)
 */
router.get('/engagement', getEngagementByDepartment);

router.post('/users', createUser);

export default router;
