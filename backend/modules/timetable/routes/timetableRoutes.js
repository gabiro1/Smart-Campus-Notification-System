import express from "express";
import {
  getTimetable,
  getTimetableByClass,
  getTimetableByLecturer,
  createTimetable,
  updateTimetable,
  deleteTimetable
} from "../controller/timetableController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Public-ish: All authenticated users can view timetable
router.get("/", protect, getTimetable);
router.get("/class/:classId", protect, getTimetableByClass);
router.get("/lecturer/:lecturerId", protect, getTimetableByLecturer);

// Admin/HOD only for mutations
router.post("/", protect, authorize('admin', 'hod'), createTimetable);
router.put("/:id", protect, authorize('admin', 'hod'), updateTimetable);
router.delete("/:id", protect, authorize('admin', 'hod'), deleteTimetable);

export default router;
