import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getAllOffices,
  getOffice,
  getOfficeStaff,
  getQueueStatus
} from "../controller/officeController.js";

const router = express.Router();

router.get("/", protect, getAllOffices);
router.get("/:id", protect, getOffice);
router.get("/:id/staff", protect, getOfficeStaff);
router.get("/:id/queue-status", protect, getQueueStatus);

export default router;
