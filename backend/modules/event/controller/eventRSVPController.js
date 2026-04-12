import EventRSVP from "../model/EventRSVP.js";
import Event from "../model/Event.js";
import User from "../../user/model/User.js";
import asyncHandler from "express-async-handler";

// @desc    RSVP to an event
// @route   POST /api/events/rsvp
// @access  Private
export const rsvpEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  if (!eventId) {
    return res.status(400).json({ success: false, message: "Event ID is required" });
  }

  // Check event exists and is active
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Create or update RSVP
  const rsvp = await EventRSVP.findOneAndUpdate(
    { eventId, userId },
    { status: "going" },
    { upsert: true, new: true, runValidators: true }
  ).populate("userId", "name email");

  res.status(200).json({ success: true, data: rsvp });
});

// @desc    Update RSVP status (maybe/declined)
// @route   PUT /api/events/rsvp
// @access  Private
export const updateRSVP = asyncHandler(async (req, res) => {
  const { eventId, status } = req.body;
  const userId = req.user._id;

  if (!eventId || !status) {
    return res.status(400).json({ success: false, message: "Event ID and status are required" });
  }

  const rsvp = await EventRSVP.findOneAndUpdate(
    { eventId, userId },
    { status },
    { new: true, runValidators: true }
  ).populate("userId", "name email");

  if (!rsvp) {
    return res.status(404).json({ success: false, message: "RSVP not found" });
  }

  res.status(200).json({ success: true, data: rsvp });
});

// @desc    Get event attendees (who is going)
// @route   GET /api/events/:eventId/attendees
// @access  Private
export const getAttendees = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const attendees = await EventRSVP.find({ eventId, status: "going" })
    .populate("userId", "name email profilePicture");

  res.status(200).json({ success: true, count: attendees.length, data: attendees });
});

// @desc    Get current user's RSVP status for an event
// @route   GET /api/events/:eventId/rsvp
// @access  Private
export const getUserRSVP = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  const rsvp = await EventRSVP.findOne({ eventId, userId });

  res.status(200).json({ success: true, data: rsvp });
});

// @desc    Remove RSVP (unattend)
// @route   DELETE /api/events/rsvp
// @access  Private
export const deleteRSVP = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  const rsvp = await EventRSVP.findOneAndDelete({ eventId, userId });

  if (!rsvp) {
    return res.status(404).json({ success: false, message: "RSVP not found" });
  }

  res.status(200).json({ success: true, message: "RSVP removed" });
});

// @desc    Scan attendance via QR (mark student as attended)
// @route   POST /api/events/:id/scan-attendance
// @access  Private (Lecturer/Admin/HOD of event's department)
export const scanAttendance = asyncHandler(async (req, res) => {
  const { id: eventId } = req.params;
  let { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, message: "Student ID is required" });
  }

  console.log("Looking for student with ID:", studentId);

  // Handle QR code format: "mongodbId:identifier" or JSON {"e":"eventId","s":"mongodbId:identifier"}
  let parsedStudentId = studentId;
  
  // Try JSON format first {"e":"...","s":"..."}
  try {
    const parsed = JSON.parse(studentId);
    if (parsed.s && parsed.s.includes(':')) {
      parsedStudentId = parsed.s.split(':')[0]; // Get mongodbId part
    } else if (parsed.s) {
      parsedStudentId = parsed.s;
    }
    console.log("Parsed JSON QR data, using:", parsedStudentId);
  } catch (e) {
    // Not JSON, check if it's the "mongodbId:identifier" format
    if (studentId.includes(':')) {
      parsedStudentId = studentId.split(':')[0]; // Get mongodbId part
      console.log("Parsed colon format, using:", parsedStudentId);
    }
  }
  
  // Try to find student - first by _id (parsed), then by studentId field, then by email
  let student = null;
  try {
    student = await User.findById(parsedStudentId).select('name email studentId studentID');
    console.log("Found by _id:", student?.name);
  } catch (e) {
    console.log("Not valid ObjectId, trying other methods");
  }
  
  if (!student) {
    student = await User.findOne({ studentId: parsedStudentId }).select('name email studentId studentID');
    console.log("Found by studentId:", student?.name);
  }
  
  if (!student) {
    student = await User.findOne({ studentID: parsedStudentId }).select('name email studentId studentID');
    console.log("Found by studentID:", student?.name);
  }
  
  if (!student) {
    student = await User.findOne({ email: parsedStudentId }).select('name email studentId studentID');
    console.log("Found by email:", student?.name);
  }
  
  if (!student) {
    student = await User.findOne({ name: parsedStudentId }).select('name email studentId studentID');
    console.log("Found by name:", student?.name);
  }

  if (!student) {
    console.log("Student not found in any field");
    return res.status(404).json({ success: false, message: "Student not found" });
  }

  // Check event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Authorization: Only event creator, admin, or HOD of same department can scan
  const userId = req.user._id;
  const userRole = req.user.role;
  const isEventCreator = event.createdBy?.toString() === userId.toString();
  const isAdmin = ['admin', 'hod', 'dean', 'principal'].includes(userRole);
  const sameDepartment = event.targetDepartment?.toString() === req.user?.department?.toString();

  if (!isEventCreator && !isAdmin && !(userRole === 'hod' && sameDepartment)) {
    return res.status(403).json({ success: false, message: "Not authorized to scan attendance" });
  }

  // Find or create RSVP record
  let rsvp = await EventRSVP.findOne({ eventId, userId: student._id });

  if (!rsvp) {
    // Auto-create RSVP record and mark as attended
    rsvp = await EventRSVP.create({
      eventId,
      userId: student._id,
      status: 'going',
      attended: true,
      scannedAt: new Date()
    });
    console.log("Auto-created RSVP for:", student.name);
  } else if (rsvp.attended) {
    // Already attended
    return res.status(200).json({
      success: true,
      message: `${student.name} was already marked as attended`,
      data: {
        rsvpId: rsvp._id,
        student: { _id: student._id, name: student.name, email: student.email },
        attended: true,
        scannedAt: rsvp.scannedAt
      }
    });
  } else {
    // Mark as attended
    rsvp.attended = true;
    rsvp.scannedAt = new Date();
    await rsvp.save();
  }

  // Populate for response
  await rsvp.populate('userId', 'name email profilePicture');

  res.status(200).json({
    success: true,
    message: `${student.name} marked as attended successfully`,
    data: rsvp
  });
});
