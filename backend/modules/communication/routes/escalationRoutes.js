import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getMyEscalations,
  getEscalation,
  resolveEscalationHandler,
  forceEscalate
} from "../controller/escalationController.js";

const router = express.Router();

router.get("/", protect, getMyEscalations);
router.get("/:id", protect, getEscalation);
router.patch("/:id/resolve", protect, resolveEscalationHandler);
router.post("/:id/escalate", protect, forceEscalate);

export default router;
