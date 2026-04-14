import express from "express";
import {
  getAuditLogs,
  getAuditLog,
  deleteOldAuditLogs,
  createAuditLog
} from "../controller/auditController.js";
import {protect} from "../../../middleware/authMiddleware.js";
import {authorize} from "../../../middleware/authMiddleware.js";

const router = express.Router();

// All audit routes require admin access
router.use(protect);
router.use(authorize('admin', 'principal', 'hod')); // Admins, principals, and HODs

router.get("/", getAuditLogs);
router.get("/:id", getAuditLog);
router.delete("/", deleteOldAuditLogs);
// createAuditLog may be used internally by middleware or other controllers
router.post("/", createAuditLog);

export default router;
