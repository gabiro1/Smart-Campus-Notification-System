import express from "express";
import {
  getPrincipalOverview,
  getDepartmentAnalytics,
  getCommunicationTrends,
  getApprovalAnalytics,
  getPendingRoleAssignments,
  approveRoleAssignment,
  rejectRoleAssignment,
  activateRoleAssignment,
  resendSetupEmail,
} from "../controllers/principalController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("principal", "admin"));

router.get("/overview", getPrincipalOverview);
router.get("/departments", getDepartmentAnalytics);
router.get("/communication-trends", getCommunicationTrends);
router.get("/approval-analytics", getApprovalAnalytics);

router.get("/role-assignments/pending", getPendingRoleAssignments);
router.put("/role-assignments/:id/approve", approveRoleAssignment);
router.put("/role-assignments/:id/reject", rejectRoleAssignment);
router.post("/role-assignments/:id/activate", activateRoleAssignment);
router.post("/role-assignments/:id/resend-email", resendSetupEmail);

export default router;
