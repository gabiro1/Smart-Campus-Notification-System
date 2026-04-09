import express from 'express';
const router = express.Router();

import { 
  createTicket, 
  getMyTickets, 
  getAllTickets, 
  replyToTicket, 
  deleteTicket,
  getTicketById
} from '../controller/supportController.js';

import { protect, authorize } from '../../../middleware/authMiddleware.js';

// ==========================================
// ALL AUTHENTICATED USERS
// ==========================================
// POST /api/support - Submit a new ticket
router.post('/', protect, createTicket);

// GET /api/support/my - Get my tickets
router.get('/my', protect, getMyTickets);

// GET /api/support/:id - Get single ticket
router.get('/:id', protect, getTicketById);

// ==========================================
// ADMIN/HOD/DEAN ROUTES
// ==========================================
// GET /api/support/all - Get all tickets (admin, principal, hod, dean)
router.get('/all', protect, authorize('admin', 'principal', 'hod', 'dean'), getAllTickets);

// PUT /api/support/:id/reply - Reply to ticket
router.put('/:id/reply', protect, authorize('admin', 'principal', 'hod', 'dean'), replyToTicket);

// DELETE /api/support/:id - Delete ticket
router.delete('/:id', protect, authorize('admin', 'principal'), deleteTicket);

// Legacy admin route
router.get('/', protect, authorize('admin', 'principal', 'hod', 'dean'), getAllTickets);

export default router;
