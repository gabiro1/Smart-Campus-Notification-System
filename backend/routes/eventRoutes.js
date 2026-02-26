import express from 'express';
const router = express.Router();
// Import Controllers
import {
    createEvent,
    getStudentFeed,
    updateEvent,
    deleteEvent,
    interestInEvent,
    rateEvent,
    getEventDetails,
    getEvents,
    searchEvents,
    getEventStats,
    getEventsByDepartment,
    getDepartments
} from '../controllers/eventController.js';
// Import Security Middleware
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateEvent } from '../middleware/validateEvent.js';

/**
 * @route   POST /api/events/create
 * @desc    Create an event and trigger targeted AI notifications
 * @access  Private (Admin, Guild, Lecturer)
 */
router.post(
    '/create', 
    protect, 
    authorize('admin', 'guild', 'lecturer'), 
    validateEvent, 
    createEvent
);

/**
 * @route   GET /api/events/feed
 * @desc    Get AI-filtered events based on Student's School/Dept/Level
 * @access  Private (All logged-in users)
 */
router.get('/feed', protect, getStudentFeed);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event details (Triggers "Change Alert" to students)
 * @access  Private (Admin, Guild, Lecturer)
 */
router.put(
    '/:id', 
    protect, 
    authorize('admin', 'guild', 'lecturer'), 
    updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Cancel an event (Triggers "Cancellation" notification)
 * @access  Private (Admin, Guild, Lecturer)
 */
router.delete(
    '/:id', 
    protect, 
    authorize('admin', 'guild', 'lecturer'), 
    deleteEvent
);

/**
 * @route   POST /api/events/:id/interest
 * @desc    Student marks interest (Feeds the AI Recommender Engine)
 * @access  Private (Student)
 */
router.post('/:id/interest', protect, interestInEvent);
router.post('/:id/rate', protect, rateEvent);

/**
 * @route   GET /api/events
 * @desc    Get all events with pagination and filters
 * @access  Public
 */
router.get('/', getEvents);

/**
 * @route   GET /api/events/search
 * @desc    Search events by title, description, or tags
 * @access  Public
 */
router.get('/search', searchEvents);

/**
 * @route   GET /api/events/department
 * @desc    Get events by specific department
 * @access  Public
 */
router.get('/department', getEventsByDepartment);

/**
 * @route   GET /api/events/departments
 * @desc    Get all unique departments that have events
 * @access  Public
 */
router.get('/departments', getDepartments);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event details with stats
 * @access  Private (optional auth for match score)
 */
router.get('/:id', protect, getEventDetails);

/**
 * @route   GET /api/events/:id/stats
 * @desc    Get event statistics (ratings, engagement)
 * @access  Private (Admin, Event Creator)
 */
router.get('/:id/stats', protect, getEventStats);

export default router;