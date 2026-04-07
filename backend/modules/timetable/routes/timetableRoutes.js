import express from "express";
import {
  getTimetable,
  getTimetableByClass,
  getTimetableByLecturer,
  createTimetable,
  updateTimetable,
  deleteTimetable
} from "../controller/timetableController.js";
import {protect} from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Public-ish: All authenticated users can view timetable
router.get("/", protect, getTimetable);
router.get("/class/:classId", protect, getTimetableByClass);
router.get("/lecturer/:lecturerId", protect, getTimetableByLecturer);

// Admin/HOD only for mutations
router.post("/", protect, createTimetable);
router.put("/:id", protect, updateTimetable);
router.delete("/:id", protect, deleteTimetable);

export default router;
