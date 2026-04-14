import express from 'express';
const router = express.Router();

console.log('[BACKUP] Loading routes...');

import {
  getBackups,
  createBackup,
  restoreBackup,
  deleteBackup
} from '../controller/backupController.js';
import { protect, authorize } from '../../../middleware/authMiddleware.js';

console.log('[BACKUP] Middleware loaded');

// All routes need auth
router.use(protect, authorize('admin', 'principal'));

router.get('/', getBackups);
router.post('/', createBackup);
router.post('/:backupId/restore', restoreBackup);
router.delete('/:backupId', deleteBackup);

console.log('[BACKUP] Routes registered');

export default router;