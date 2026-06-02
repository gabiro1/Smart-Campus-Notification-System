import express from 'express';
import multer from 'multer';
import path from 'path';
const router = express.Router();

import {
  createDraft,
  updateDraft,
  submitEvent,
  createAndPublish,
  getStudentFeed,
  getEventDetails,
  getEvents,
  searchEvents,
  getEventStats,
  deleteEvent,
  cancelEvent,
  parseFlyer,
  exportCalendar,
  toggleBookmark,
  getBookmarkedEvents,
  studentCheckIn,
  interestInEvent,
  rateEvent
} from '../controllers/eventController.js';

import {
  getReviewQueue,
  getReviewQueueByStatus,
  approveEvent,
  rejectEvent,
  requestRevision,
  publishEvent,
  scheduleEvent,
  escalateEvent,
  overrideDecision,
  getEventAudit,
  getDashboardAnalytics,
  getCreatorEvents
} from '../controllers/reviewController.js';

import {
  uploadPoster,
  uploadAttachment,
  getAttachments,
  deleteAttachment
} from '../controllers/uploadController.js';

import {
  rsvpEvent,
  updateRSVP,
  deleteRSVP,
  getUserRSVP,
  getAttendees,
  scanAttendance
} from '../controllers/rsvpController.js';

import { protect, authorize } from '../../../middleware/authMiddleware.js';
import { validateBody, schemas } from '../../../middleware/validation.js';
import { auditLog } from '../../../middleware/auditMiddleware.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/posters/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

const attachmentUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|mp3|wav/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('File type not supported'), false);
  }
});

/* ================= INSTITUTIONAL EVENT WORKFLOW ================= */

router.post('/draft',
  protect,
  authorize('student', 'class_rep', 'lecturer', 'hod', 'dean', 'guild_president', 'principal', 'admin'),
  validateBody(schemas.eventCreation),
  auditLog('event'),
  createDraft
);

router.put('/draft/:id',
  protect,
  authorize('student', 'class_rep', 'lecturer', 'hod', 'dean', 'guild_president', 'principal', 'admin'),
  validateBody(schemas.eventUpdate),
  auditLog('event', { captureChanges: true }),
  updateDraft
);

router.post('/draft/:id/submit',
  protect,
  authorize('student', 'class_rep', 'lecturer', 'hod', 'dean', 'guild_president', 'principal', 'admin'),
  auditLog('event'),
  submitEvent
);

router.post('/publish',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  validateBody(schemas.eventCreation),
  auditLog('event'),
  createAndPublish
);

/* ================= REVIEW WORKFLOW (Guild Council) ================= */

router.get('/review/queue',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  getReviewQueue
);

router.get('/review/queue/status',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  getReviewQueueByStatus
);

router.post('/:id/approve',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  auditLog('event'),
  approveEvent
);

router.post('/:id/reject',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  auditLog('event'),
  rejectEvent
);

router.post('/:id/request-revision',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  auditLog('event'),
  requestRevision
);

router.post('/:id/publish',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  auditLog('event'),
  publishEvent
);

router.post('/:id/schedule',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  auditLog('event'),
  scheduleEvent
);

router.post('/:id/escalate',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  auditLog('event'),
  escalateEvent
);

router.post('/:id/override',
  protect,
  authorize('principal', 'admin'),
  auditLog('event'),
  overrideDecision
);

/* ================= DASHBOARD & ANALYTICS ================= */

router.get('/dashboard/analytics',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  getDashboardAnalytics
);

router.get('/dashboard/my-events',
  protect,
  getCreatorEvents
);

/* ================= AUDIT ================= */

router.get('/:id/audit',
  protect,
  authorize('guild_president', 'principal', 'admin'),
  getEventAudit
);

/* ================= FEED & DISCOVERY ================= */

router.get('/feed', protect, getStudentFeed);
router.get('/', protect, getEvents);
router.get('/search', searchEvents);

/* ================= EVENT DETAILS & CRUD ================= */

router.get('/bookmarks', protect, getBookmarkedEvents);
router.get('/:id/stats', protect, authorize('admin', 'guild_president', 'lecturer', 'hod', 'dean', 'principal'), getEventStats);
router.get('/:id', protect, getEventDetails);
router.get('/:id/calendar', protect, exportCalendar);
router.post('/:id/cancel', protect, cancelEvent);
router.delete('/:id', protect, authorize('admin', 'guild_president'), deleteEvent);

/* ================= FLYER PARSING ================= */

router.post('/parse-flyer',
  protect,
  authorize('guild_president', 'principal', 'lecturer', 'hod', 'admin'),
  upload.single('flyer'),
  parseFlyer
);

/* ================= UPLOADS ================= */

router.post('/upload/poster',
  protect,
  upload.single('poster'),
  uploadPoster
);

router.post('/upload/poster/:id',
  protect,
  upload.single('poster'),
  uploadPoster
);

router.post('/upload/attachment/:id',
  protect,
  attachmentUpload.single('attachment'),
  uploadAttachment
);

router.get('/:id/attachments', protect, getAttachments);
router.delete('/attachments/:attachmentId', protect, deleteAttachment);

/* ================= BOOKMARKS ================= */

router.post('/:id/bookmark', protect, toggleBookmark);

/* ================= INTEREST & RATING ================= */

router.post('/:id/interest', protect, interestInEvent);
router.post('/:id/rate', protect, rateEvent);

/* ================= ATTENDANCE ================= */

router.post('/:id/scan-attendance', protect, authorize('admin', 'lecturer', 'hod', 'dean', 'principal'), scanAttendance);
router.post('/:id/check-in', protect, studentCheckIn);

/* ================= RSVP ================= */

router.post('/rsvp', protect, rsvpEvent);
router.put('/rsvp', protect, updateRSVP);
router.delete('/rsvp', protect, deleteRSVP);
router.get('/rsvp/:eventId', protect, getUserRSVP);
router.get('/rsvp/:eventId/attendees', protect, getAttendees);

export default router;
