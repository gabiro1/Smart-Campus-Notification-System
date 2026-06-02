import express from 'express';
const router = express.Router();
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
} from '../controller/roleController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

router.use(protect);

router.get('/', authorize('admin', 'principal', 'hod'), getRoles);
router.get('/:id', authorize('admin', 'principal', 'hod'), getRole);
router.post('/', authorize('admin'), createRole);
router.put('/:id', authorize('admin'), updateRole);
router.delete('/:id', authorize('admin'), deleteRole);

export default router;
