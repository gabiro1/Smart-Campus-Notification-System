import express from 'express';
const router = express.Router();

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
    getPendingApprovals,
    processApproval
} from '../controllers/eventController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateEvent } from '../middleware/validateEvent.js';

/* ================= CREATE EVENT ================= */
router.post('/create', protect, authorize('admin', 'guild', 'lecturer'), validateEvent, createEvent);

/* ================= STUDENT FEED ================= */
router.get('/feed', protect, getStudentFeed);

/* ================= UPDATE & DELETE ================= */
router.put('/:id', protect, authorize('admin', 'guild', 'lecturer'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'guild', 'lecturer'), deleteEvent);

/* ================= INTEREST & RATE ================= */
router.post('/:id/interest', protect, interestInEvent);
router.post('/:id/rate', protect, rateEvent);

/* ================= GET EVENTS ================= */
router.get('/', getEvents);
router.get('/search', searchEvents);
router.get('/department', getEventsByDepartment);
router.get('/:id/stats', protect, getEventStats);
router.get('/:id', protect, getEventDetails);

/* ================= PENDING APPROVALS ================= */
router.get('/approvals/pending', protect, authorize('dean', 'principal', 'lecturer'), getPendingApprovals);
router.post('/approvals/:pulseId', protect, authorize('dean', 'principal', 'lecturer'), processApproval);

export default router;