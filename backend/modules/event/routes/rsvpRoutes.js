import express from "express";
import {
  rsvpEvent,
  updateRSVP,
  getAttendees,
  getUserRSVP,
  deleteRSVP
} from "../controller/eventRSVPController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, rsvpEvent);
router.put("/", protect, updateRSVP);
router.get("/:eventId", protect, getUserRSVP);
router.delete("/", protect, deleteRSVP);
router.get("/:eventId/attendees", protect, getAttendees);

export default router;
