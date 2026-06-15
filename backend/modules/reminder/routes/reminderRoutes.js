import express from 'express';
const router = express.Router();
import {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  cancelReminder,
  completeReminder,
  uncompleteReminder,
  bulkCompleteReminders,
  bulkDeleteReminders,
  getReminderPreferences,
  updateReminderPreferences,
  getDueReminders,
  getReminderTimeline,
  getReminderRecipients,
  getReminderStats,
} from '../controller/reminderController.js';
import { protect } from '../../../middleware/authMiddleware.js';
import { validateBody, schemas } from '../../../middleware/validation.js';

/**
 * @route   GET /api/reminders
 * @desc    Get all reminders for the logged-in user
 * @access  Private
 */
router.get('/', protect, getReminders);

/**
 * @route   GET /api/reminders/stats
 * @desc    Get reminder analytics for the logged-in user
 * @access  Private
 */
router.get('/stats', protect, getReminderStats);

/**
 * @route   GET /api/reminders/timeline
 * @desc    Get reminders grouped by time period
 * @access  Private
 */
router.get('/timeline', protect, getReminderTimeline);

/**
 * @route   GET /api/reminders/due
 * @desc    Get all overdue/due reminders
 * @access  Private
 */
router.get('/due', protect, getDueReminders);

/**
 * @route   GET /api/reminders/preferences
 * @desc    Get reminder notification preferences
 * @access  Private
 */
router.get('/preferences', protect, getReminderPreferences);

/**
 * @route   PUT /api/reminders/preferences
 * @desc    Update reminder notification preferences
 * @access  Private
 */
router.put('/preferences', protect, validateBody(schemas.reminderPreferenceUpdate), updateReminderPreferences);

/**
 * @route   POST /api/reminders
 * @desc    Create a new reminder
 * @access  Private
 */
router.post('/', protect, validateBody(schemas.reminderCreation), createReminder);

/**
 * @route   POST /api/reminders/bulk/complete
 * @desc    Mark multiple reminders as complete
 * @access  Private
 */
router.post('/bulk/complete', protect, bulkCompleteReminders);

/**
 * @route   POST /api/reminders/bulk/delete
 * @desc    Delete multiple reminders
 * @access  Private
 */
router.post('/bulk/delete', protect, bulkDeleteReminders);

/**
 * @route   GET /api/reminders/:id
 * @desc    Get a single reminder by ID
 * @access  Private
 */
router.get('/:id', protect, getReminderById);

/**
 * @route   PUT /api/reminders/:id
 * @desc    Update a reminder
 * @access  Private
 */
router.put('/:id', protect, validateBody(schemas.reminderUpdate), updateReminder);

/**
 * @route   DELETE /api/reminders/:id
 * @desc    Delete a reminder
 * @access  Private
 */
router.delete('/:id', protect, deleteReminder);

/**
 * @route   POST /api/reminders/:id/cancel
 * @desc    Cancel a reminder
 * @access  Private
 */
router.post('/:id/cancel', protect, cancelReminder);

/**
 * @route   POST /api/reminders/:id/complete
 * @desc    Mark reminder as complete
 * @access  Private
 */
router.post('/:id/complete', protect, completeReminder);

/**
 * @route   POST /api/reminders/:id/uncomplete
 * @desc    Mark reminder as incomplete
 * @access  Private
 */
router.post('/:id/uncomplete', protect, uncompleteReminder);

/**
 * @route   GET /api/reminders/:id/recipients
 * @desc    Get delivery recipients for a reminder
 * @access  Private
 */
router.get('/:id/recipients', protect, getReminderRecipients);

export default router;
