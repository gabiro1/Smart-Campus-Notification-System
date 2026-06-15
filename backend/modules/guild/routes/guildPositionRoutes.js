import express from 'express';
import { protect, authorize } from '../../../middleware/authMiddleware.js';
import {
  getGuildPositions,
  addGuildPosition,
  deleteGuildPosition,
  getGuildMembers,
  assignGuildPosition,
  removeGuildPosition,
} from '../controllers/guildPositionController.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'principal'), getGuildPositions);
router.post('/', authorize('admin'), addGuildPosition);
router.delete('/:id', authorize('admin'), deleteGuildPosition);

router.get('/members', authorize('admin', 'principal'), getGuildMembers);
router.post('/assign', authorize('admin'), assignGuildPosition);
router.post('/remove/:userId', authorize('admin'), removeGuildPosition);

export default router;
