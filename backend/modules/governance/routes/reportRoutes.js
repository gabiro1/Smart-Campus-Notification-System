import express from 'express';
import {
  createReport,
  submitReport,
  getPendingReview,
  getApprovedReports,
  getReport,
  getMyReports,
  updateReport,
  startReview,
  approveReport,
  rejectReport,
  requestRevision,
  acknowledgeReport,
  escalateReport,
  addNote,
  uploadAttachment,
  getReportAnalytics,
} from '../controller/reportController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import upload from '../../../middleware/uploadMiddleware.js';

const router = express.Router();

// ── AUTHORING (HoD/lecturer) ──
router.post('/', protect, authorize('lecturer', 'hod', 'dean', 'principal', 'admin'), upload.array('attachments', 5), createReport);
router.put('/:id/submit', protect, authorize('hod', 'lecturer', 'dean', 'principal', 'admin'), submitReport);
router.get('/mine', protect, authorize('lecturer', 'hod', 'dean', 'principal', 'admin'), getMyReports);
router.put('/:id', protect, authorize('hod', 'lecturer', 'dean'), upload.array('attachments', 5), updateReport);
router.post('/:id/attachments', protect, authorize('hod', 'lecturer', 'dean'), upload.array('attachments', 5), uploadAttachment);

// ── REVIEW (Dean/Principal) ──
router.get('/pending-review', protect, authorize('dean', 'principal', 'admin'), getPendingReview);
router.put('/:id/start-review', protect, authorize('dean', 'principal', 'admin'), startReview);
router.put('/:id/approve', protect, authorize('dean', 'principal', 'admin'), approveReport);
router.put('/:id/reject', protect, authorize('dean', 'principal', 'admin'), rejectReport);
router.put('/:id/request-revision', protect, authorize('dean', 'principal', 'admin'), requestRevision);

// ── ACKNOWLEDGEMENT (Dean/Principal) ──
router.put('/:id/acknowledge', protect, authorize('dean', 'principal', 'admin'), acknowledgeReport);

// ── ESCALATION ──
router.put('/:id/escalate', protect, authorize('dean', 'principal', 'admin'), escalateReport);

// ── NOTES ──
router.post('/:id/notes', protect, authorize('dean', 'hod', 'principal', 'admin'), addNote);

// ── ANALYTICS (approved-only) ──
router.get('/analytics', protect, authorize('dean', 'principal', 'admin'), getReportAnalytics);
router.get('/approved', protect, authorize('hod', 'dean', 'principal', 'admin'), getApprovedReports);

// ── SINGLE REPORT ──
router.get('/:id', protect, getReport);

export default router;
