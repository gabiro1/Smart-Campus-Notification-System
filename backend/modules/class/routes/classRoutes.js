import express from "express";
import { 
  assignLecturers, 
  getClasses,
  getLecturers,
  assignClassToLecturer,
  removeClassFromLecturer,
  updateLecturerInfo
} from "../controller/classController.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// YOUR ORIGINAL ROUTES
// ==========================================
// Get all classes for admin/HoD view
router.get("/", protect, getClasses); 

// Bulk assign multiple lecturers to a single class at once
router.put("/:classId/assignLecturers", protect, authorize("hod"), assignLecturers);


// ==========================================
// NEW DASHBOARD ROUTES (HOD Only)
// ==========================================
// Get all lecturers in the department and the classes they teach
router.get("/lecturers", protect, authorize("hod"), getLecturers);

// Assign a single class to a specific lecturer (from the modal)
router.post("/lecturers/:lecturerId/assign", protect, authorize("hod"), assignClassToLecturer);

// Remove a single class from a specific lecturer (the trash can icon)
router.delete("/lecturers/:lecturerId/remove/:classId", protect, authorize("hod"), removeClassFromLecturer);

// Update lecturer contact information (the edit modal)
router.put("/lecturers/:id", protect, authorize("hod"), updateLecturerInfo);

export default router;