import express from "express";
import { smartSearch } from "../controller/searchController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Smart search endpoint (requires authentication)
router.get('/', protect, smartSearch);

export default router;
