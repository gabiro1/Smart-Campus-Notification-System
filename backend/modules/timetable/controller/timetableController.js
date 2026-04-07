import Timetable from "../model/Timetable.js";
import asyncHandler from "express-async-handler";

// @desc    Get all timetable entries (with filters)
// @route   GET /api/timetable
// @access  Private (Admin, HOD, Lecturer)
export const getTimetable = asyncHandler(async (req, res) => {
  const { classId, lecturerId, dayOfWeek } = req.query;

  const filter = {};
  if (classId) filter.classId = classId;
  if (lecturerId) filter.lecturerId = lecturerId;
  if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

  const entries = await Timetable.find(filter)
    .populate("classId", "code name")
    .populate("lecturerId", "name email")
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.status(200).json({ success: true, data: entries });
});

// @desc    Get timetable by class
// @route   GET /api/timetable/class/:classId
// @access  Private
export const getTimetableByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const entries = await Timetable.find({ classId })
    .populate("lecturerId", "name email")
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.status(200).json({ success: true, data: entries });
});

// @desc    Get timetable by lecturer
// @route   GET /api/timetable/lecturer/:lecturerId
// @access  Private (Admin, HOD, self)
export const getTimetableByLecturer = asyncHandler(async (req, res) => {
  const { lecturerId } = req.params;
  // Authorization: HOD can view lecturer timetable for their department, or self
  const user = req.user;
  if (
    !(user.role === "admin" || user.role === "hod" ||
      (user.role === "lecturer" && user._id.toString() === lecturerId))
  ) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const entries = await Timetable.find({ lecturerId })
    .populate("classId", "code name")
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.status(200).json({ success: true, data: entries });
});

// @desc    Create timetable entry
// @route   POST /api/timetable
// @access  Private (Admin, HOD)
export const createTimetable = asyncHandler(async (req, res) => {
  const { classId, lecturerId, dayOfWeek, startTime, endTime, venue, topic, recurringPattern } = req.body;

  // Validation: ensure class and lecturer exist (implicitly via ref)
  const entry = await Timetable.create({
    classId,
    lecturerId,
    dayOfWeek,
    startTime,
    endTime,
    venue,
    topic,
    recurringPattern
  });

  await entry.populate("classId", "code name");
  await entry.populate("lecturerId", "name email");

  res.status(201).json({ success: true, data: entry });
});

// @desc    Update timetable entry
// @route   PUT /api/timetable/:id
// @access  Private (Admin, HOD)
export const updateTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({ success: false, message: "Timetable entry not found" });
  }

  // Only Admin/HOD can update
  if (!["admin", "hod"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const updated = await Timetable.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("classId", "code name").populate("lecturerId", "name email");

  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private (Admin, HOD)
export const deleteTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({ success: false, message: "Timetable entry not found" });
  }

  if (!["admin", "hod"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  await entry.deleteOne();
  res.status(200).json({ success: true, message: "Timetable entry removed" });
});
