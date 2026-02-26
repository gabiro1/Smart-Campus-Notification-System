import express from 'express';
const router = express.Router();
import {
  getReminders,
  getReminderDetails,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  uncompleteReminder,
  getDueReminders,
  getUpcomingReminders
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

/**
 * @route   GET /api/reminders
 * @desc    Get all reminders for the logged-in student
 * @access  Private
 */
router.get('/', protect, getReminders);

/**
 * @route   GET /api/reminders/due
 * @desc    Get all overdue/due reminders
 * @access  Private
 */
router.get('/due', protect, getDueReminders);

/**
 * @route   GET /api/reminders/upcoming
 * @desc    Get upcoming reminders for next 7 days
 * @access  Private
 */
router.get('/upcoming', protect, getUpcomingReminders);

/**
 * @route   GET /api/reminders/:id
 * @desc    Get a single reminder details
 * @access  Private
 */
router.get('/:id', protect, getReminderDetails);

/**
 * @route   POST /api/reminders
 * @desc    Create a new reminder
 * @access  Private
 */
router.post('/', protect, createReminder);

/**
 * @route   PUT /api/reminders/:id
 * @desc    Update a reminder
 * @access  Private
 */
router.put('/:id', protect, updateReminder);

/**
 * @route   DELETE /api/reminders/:id
 * @desc    Delete a reminder
 * @access  Private
 */
router.delete('/:id', protect, deleteReminder);

/**
 * @route   POST /api/reminders/:id/complete
 * @desc    Mark a reminder as complete
 * @access  Private
 */
router.post('/:id/complete', protect, completeReminder);

/**
 * @route   POST /api/reminders/:id/uncomplete
 * @desc    Mark a reminder as incomplete
 * @access  Private
 */
router.post('/:id/uncomplete', protect, uncompleteReminder);

export default router;
