import express from 'express';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import {
  submitElectionResult,
  getPendingElections,
  getElectionHistory,
  approveElection,
  rejectElection,
  getActiveGuildPresident,
  suspendGuildPresident,
  proposeClassRep,
  getPendingClassReps,
  getAllClassReps,
  getMyProposals,
  approveClassRep,
  rejectClassRep,
  getLeadershipStats,
  submitCouncilElection,
  getPendingCouncilElections,
  getCouncilHistory,
  getActiveCouncil,
  approveCouncilElection,
  rejectCouncilElection,
  suspendCouncil,
} from '../controllers/leadershipController.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getLeadershipStats);

router.get('/guild-president/active', getActiveGuildPresident);

router.get('/guild-president/pending', authorize('principal', 'admin'), getPendingElections);
router.get('/guild-president/history', authorize('principal', 'admin', 'hod'), getElectionHistory);
router.post('/guild-president/election', authorize('admin'), submitElectionResult);
router.put('/guild-president/:id/approve', authorize('principal', 'admin'), approveElection);
router.put('/guild-president/:id/reject', authorize('principal', 'admin'), rejectElection);
router.put('/guild-president/:id/suspend', authorize('principal', 'admin'), suspendGuildPresident);

router.get('/council/active', getActiveCouncil);
router.get('/council/pending', authorize('principal', 'admin'), getPendingCouncilElections);
router.get('/council/history', authorize('principal', 'admin', 'hod'), getCouncilHistory);
router.post('/council/election', authorize('admin'), submitCouncilElection);
router.put('/council/:id/approve', authorize('principal', 'admin'), approveCouncilElection);
router.put('/council/:id/reject', authorize('principal', 'admin'), rejectCouncilElection);
router.put('/council/:id/suspend', authorize('principal', 'admin'), suspendCouncil);

router.post('/class-reps/propose', authorize('guild_president', 'admin'), proposeClassRep);
router.get('/class-reps/pending', authorize('hod', 'principal', 'admin'), getPendingClassReps);
router.get('/class-reps/all', authorize('hod', 'principal', 'admin', 'guild_president'), getAllClassReps);
router.get('/class-reps/my-proposals', authorize('guild_president'), getMyProposals);
router.put('/class-reps/:id/approve', authorize('hod', 'principal', 'admin'), approveClassRep);
router.put('/class-reps/:id/reject', authorize('hod', 'principal', 'admin'), rejectClassRep);

export default router;
