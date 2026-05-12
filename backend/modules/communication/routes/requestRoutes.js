import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getTemplates,
  submitRequest,
  getMyRequests,
  getRequest,
  updateRequestStatus,
  escalateRequest
} from "../controller/requestController.js";

const router = express.Router();

router.get("/templates", protect, getTemplates);
router.post("/", protect, submitRequest);
router.get("/", protect, getMyRequests);
router.get("/:id", protect, getRequest);
router.patch("/:id/status", protect, updateRequestStatus);
router.post("/:id/escalate", protect, escalateRequest);

export default router;
