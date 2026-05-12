import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getMyContacts,
  getMyOffices,
  checkRelationship
} from "../controller/contactController.js";

const router = express.Router();

router.get("/", protect, getMyContacts);
router.get("/offices", protect, getMyOffices);
router.get("/:userId/relationship", protect, checkRelationship);

export default router;
