import express from 'express';
import multer from 'multer';
import path from 'path';
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
    processApproval,
    parseFlyer,
    exportCalendar,
    toggleBookmark,
    getBookmarkedEvents,
    studentCheckIn
} from '../controller/eventController.js';

import { protect, authorize } from '../../../middleware/authMiddleware.js';
// Class rep policy: auto-scopes events to their represented class
import { classRepPulseEventScope } from '../../../middleware/classRepPolicy.js';
import rsvpRoutes from "./rsvpRoutes.js";
import { scanAttendance } from "../controller/eventRSVPController.js";
import { validateBody, schemas } from '../../../middleware/validation.js';
import { auditLog } from '../../../middleware/auditMiddleware.js';

/* ================= MULTER UPLOAD CONFIGURATION ================= */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the 'uploads/posters/' directory exists in your project root
        cb(null, 'uploads/posters/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Not an image! Please upload a valid image file.'), false);
    }
});

/* ================= AI FLYER PARSING ================= */
// Secured with the same roles allowed to create events
router.post(
    '/parse-flyer', 
    protect, 
    authorize('admin', 'guild_president', 'lecturer'), 
    upload.single('flyer'), 
    parseFlyer
);

/* ================= CREATE EVENT ================= */
// class_rep is now allowed to create events, but classRepPulseEventScope
// middleware runs first to enforce scope='class' and auto-populate audience.
// All other roles pass through the middleware untouched.
router.post(
  '/create',
  protect,
  authorize('admin', 'guild_president', 'lecturer', 'hod', 'class_rep'),
  classRepPulseEventScope,   // ← enriches req.body for class_rep; no-op for everyone else
  validateBody(schemas.eventCreation),
  auditLog('event'),
  createEvent
);

/* ================= STUDENT FEED ================= */
router.get('/feed', protect, getStudentFeed);

/* ================= UPDATE & DELETE ================= */
// class_rep can edit/delete their own events (ownership checked inside controller if needed).
router.put('/:id',    protect, authorize('admin', 'guild_president', 'lecturer', 'hod', 'class_rep'), validateBody(schemas.eventUpdate), auditLog('event', { captureChanges: true }), updateEvent);
router.delete('/:id', protect, authorize('admin', 'guild_president', 'lecturer', 'hod', 'class_rep'), auditLog('event'), deleteEvent);

/* ================= INTEREST & RATE ================= */
router.post('/:id/interest', protect, interestInEvent);
router.post('/:id/rate', protect, rateEvent);

/* ================= GET EVENTS ================= */
// Admin/Principal can get all events, other roles get scoped events
router.get('/', protect, getEvents);
router.get('/search', searchEvents);
router.get('/department', getEventsByDepartment);

/* ================= BOOKMARKS ================= */
// IMPORTANT: Static routes like '/bookmarks' MUST be defined before
// dynamic '/:id' routes, otherwise Express will match 'bookmarks' as an id.
router.get('/bookmarks', protect, getBookmarkedEvents);

router.get('/:id/stats', protect, authorize('admin', 'guild_president', 'lecturer', 'hod', 'dean', 'principal'), getEventStats);
router.get('/:id', protect, getEventDetails);
router.get('/:id/calendar', protect, exportCalendar);
router.post('/:id/bookmark', protect, toggleBookmark);

/* ================= ATTENDANCE SCANNING ================= */
router.post('/:id/scan-attendance', protect, authorize('admin', 'lecturer', 'hod', 'dean', 'principal'), scanAttendance);

/* ================= STUDENT QR CHECK-IN ================= */
router.post('/:id/check-in', protect, studentCheckIn);

/* ================= PENDING APPROVALS ================= */
router.get('/approvals/pending', protect, authorize('dean', 'principal', 'lecturer'), getPendingApprovals);
router.post('/approvals/:pulseId', protect, authorize('dean', 'principal', 'lecturer'), processApproval);

/* ================= RSVP ================= */
router.use('/rsvp', rsvpRoutes);

export default router;