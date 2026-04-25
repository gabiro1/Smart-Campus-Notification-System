import express from 'express';
const router = express.Router();
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getDueReminders,
  completeReminder,
  uncompleteReminder,

} from '../controller/reminderController.js';
import { protect } from '../../../middleware/authMiddleware.js';
import { validateBody, schemas } from '../../../middleware/validation.js';

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
 * @route   POST /api/reminders
 * @desc    Create a new reminder
 * @access  Private
 */
router.post('/', protect, validateBody(schemas.reminderCreation), createReminder);

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


export default router;
