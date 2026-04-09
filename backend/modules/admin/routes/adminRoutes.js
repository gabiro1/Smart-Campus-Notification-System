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
    getBroadcastHistory,
    getEventMonitor,
    getDepartmentStats,
    getEngagementByDepartment,
    getActiveEmergencies,
    getSystemSettings,
    updateSystemSettings
} from '../controller/adminController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import { getAcademicHierarchy } from '../controller/adminController.js';
import { validateBody, schemas } from '../../../middleware/validation.js';
import { auditLog } from '../../../middleware/auditMiddleware.js';

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
router.put('/users/:userId', validateBody(schemas.adminUserUpdate), auditLog('user', { captureChanges: true }), updateUser);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user account
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', auditLog('user'), deleteUser);

/**
 * @route   POST /api/admin/users/:userId/promote
 * @desc    Promote user role
 * @access  Private (Admin only)
 */
router.post('/users/:userId/promote', auditLog('user', { customAction: 'PROMOTE_USER' }), promoteUser);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Private (Admin only)
 */
router.get('/analytics', getAnalytics);

/**
 * @route   GET /api/admin/broadcasts
 * @desc    Get broadcast history
 * @access  Private (Admin only)
 */
router.get('/broadcasts', getBroadcastHistory);

/**
 * @route   GET /api/admin/announcements/active-emergencies
 * @desc    Get active emergency broadcasts with acknowledgment stats
 * @access  Private (Admin only)
 */
router.get('/announcements/active-emergencies', getActiveEmergencies);

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

router.post('/users', validateBody(schemas.adminUserCreation), auditLog('user'), createUser);

router.get('/hierarchy', getAcademicHierarchy);

// Settings routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
