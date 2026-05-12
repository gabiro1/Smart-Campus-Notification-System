import express from "express";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import {
  createTicket,
  getMyTickets,
  getAssignedTickets,
  getTicket,
  updateTicketStatus,
  assignTicket,
  addInternalNote,
  escalateTicket,
  rateTicket
} from "../controller/ticketController.js";

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/", protect, getMyTickets);
router.get("/assigned", protect, getAssignedTickets);
router.get("/:id", protect, getTicket);
router.patch("/:id/status", protect, updateTicketStatus);
router.patch("/:id/assign", protect, authorize("admin", "hod", "dean"), assignTicket);
router.post("/:id/note", protect, addInternalNote);
router.post("/:id/escalate", protect, escalateTicket);
router.post("/:id/rating", protect, rateTicket);

export default router;
