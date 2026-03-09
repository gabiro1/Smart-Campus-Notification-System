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
    parseFlyer // Make sure this is exported from eventController.js
} from '../controllers/eventController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateEvent } from '../middleware/validateEvent.js';

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
router.post('/create', protect, authorize('admin', 'guild_president', 'lecturer'), validateEvent, createEvent);

/* ================= STUDENT FEED ================= */
router.get('/feed', protect, getStudentFeed);

/* ================= UPDATE & DELETE ================= */
router.put('/:id', protect, authorize('admin', 'guild_president', 'lecturer'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'guild_president', 'lecturer'), deleteEvent);

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