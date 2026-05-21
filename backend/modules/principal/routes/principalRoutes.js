import express from "express";
import {
  getPrincipalOverview,
  getDepartmentAnalytics,
  getCommunicationTrends,
  getApprovalAnalytics,
} from "../controllers/principalController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("principal"));

router.get("/overview", getPrincipalOverview);
router.get("/departments", getDepartmentAnalytics);
router.get("/communication-trends", getCommunicationTrends);
router.get("/approval-analytics", getApprovalAnalytics);

export default router;
