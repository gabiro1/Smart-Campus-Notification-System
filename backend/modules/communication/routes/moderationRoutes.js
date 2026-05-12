import express from "express";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import {
  getFlaggedContent,
  takeModerationAction,
  restrictUser,
  getRestrictions,
  liftRestriction
} from "../controller/moderationController.js";

const router = express.Router();

router.get("/flagged", protect, authorize("admin", "hod"), getFlaggedContent);
router.patch("/flagged/:id/action", protect, authorize("admin", "hod"), takeModerationAction);
router.post("/restrict", protect, authorize("admin"), restrictUser);
router.get("/restrictions", protect, authorize("admin"), getRestrictions);
router.patch("/restrictions/:id/lift", protect, authorize("admin"), liftRestriction);

export default router;
