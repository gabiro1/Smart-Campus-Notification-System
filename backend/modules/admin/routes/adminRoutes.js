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
    resetUserPassword,
    getAnalytics,
    getBroadcastHistory,
    getEventMonitor,
    getDepartmentStats,
    getEngagementByDepartment,
    getActiveEmergencies,
    getSystemSettings,
    updateSystemSettings,
    getAIInsights,
    getSystemHealth,
    runDiagnostics,
    createHRAccount,
    getHRAccounts,
    getHRAccount,
    updateHRAccount,
    deleteHRAccount,
    createRegistrarAccount,
    emergencyOverride,
    getRolePermissions
} from '../controller/adminController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import { getAcademicHierarchy } from '../controller/adminController.js';
import { validateBody, schemas } from '../../../middleware/validation.js';
import { auditLog } from '../../../middleware/auditMiddleware.js';

// All admin routes require authentication and admin, principal, or hod role
router.use(protect, authorize('admin', 'principal', 'hod'));

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
 * @access  Private (Admin or Principal only)
 */
router.put('/users/:userId', authorize('admin', 'principal'), validateBody(schemas.adminUserUpdate), auditLog('user', { captureChanges: true }), updateUser);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user account
 * @access  Private (Admin or Principal only)
 */
router.delete('/users/:userId', authorize('admin', 'principal'), auditLog('user'), deleteUser);

/**
 * @route   POST /api/admin/users/:userId/promote
 * @desc    Promote user role
 * @access  Private (Admin or Principal only)
 */
router.post('/users/:userId/promote', authorize('admin', 'principal'), auditLog('user', { customAction: 'PROMOTE_USER' }), promoteUser);

/**
 * @route   POST /api/admin/users/:userId/reset-password
 * @desc    Reset user password
 * @access  Private (Admin or Principal only)
 */
router.post('/users/:userId/reset-password', authorize('admin', 'principal'), auditLog('user', { customAction: 'RESET_PASSWORD' }), resetUserPassword);

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

// AI-powered insights
router.get('/ai-insights', getAIInsights);

// System health & diagnostics
router.get('/health', getSystemHealth);
router.post('/diagnostics', runDiagnostics);

// Role permissions configuration
router.get('/role-permissions', getRolePermissions);

// --- System Admin Only Routes ---
// HR accounts CRUD
router.get('/hr-accounts', authorize('admin'), getHRAccounts);
router.get('/hr-accounts/:id', authorize('admin'), getHRAccount);
router.post('/hr-accounts', authorize('admin'), createHRAccount);
router.put('/hr-accounts/:id', authorize('admin'), updateHRAccount);
router.delete('/hr-accounts/:id', authorize('admin'), deleteHRAccount);
// Create Registrar account  
router.post('/registrar-accounts', authorize('admin'), createRegistrarAccount);
// Emergency override
router.post('/emergency-override', authorize('admin'), emergencyOverride);

export default router;
