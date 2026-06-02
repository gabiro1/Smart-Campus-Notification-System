import express from 'express';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import {
  getHrOverview,
  createStaffDraft,
  getStaffDrafts,
  updateStaffDraft,
  deleteStaffDraft,
  submitRoleAssignment,
  getMyRoleAssignments,
  getAllRoleAssignments
} from '../controllers/hrController.js';

const router = express.Router();

router.use(protect);

router.get('/overview', authorize('hr', 'admin'), getHrOverview);
router.post('/drafts', authorize('hr', 'admin'), createStaffDraft);
router.get('/drafts', authorize('hr', 'admin'), getStaffDrafts);
router.put('/drafts/:id', authorize('hr', 'admin'), updateStaffDraft);
router.delete('/drafts/:id', authorize('hr', 'admin'), deleteStaffDraft);

router.post('/assignments', authorize('hr', 'admin'), submitRoleAssignment);
router.get('/assignments/mine', authorize('hr', 'admin'), getMyRoleAssignments);
router.get('/assignments', authorize('hr', 'admin', 'principal'), getAllRoleAssignments);

export default router;
