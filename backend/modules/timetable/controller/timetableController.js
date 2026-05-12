import Timetable from "../model/Timetable.js";
import Class from "../../class/model/Class.js";
import User from "../../user/model/User.js";
import NotificationLog from "../../notification/models/NotificationLog.js";
import asyncHandler from "express-async-handler";
import { sendPushNotification } from "../../../config/firebaseAdmin.js";
import { sendSMSViaTwilio } from "../../../services/smsService.js";
import { shouldSendNow } from "../../../utils/quietHours.js";
import nodemailer from "nodemailer";
import { io } from "../../../utils/socketServer.js";

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

const escapeHTML = (str) => {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);
};

const buildMessage = (entry, action, lecturerName) => {
  const lecturer = lecturerName || "Your lecturer";
  if (action === "created") {
    return `New class scheduled: ${entry.topic || "Lecture"} on ${entry.dayOfWeek} at ${entry.startTime}–${entry.endTime} at ${entry.venue || "TBA"} by ${lecturer}.`;
  }
  if (action === "updated") {
    return `Timetable updated: ${entry.topic || "Lecture"} on ${entry.dayOfWeek} at ${entry.startTime}–${entry.endTime} at ${entry.venue || "TBA"} by ${lecturer}.`;
  }
  return `${entry.topic || "Class"} scheduled ${entry.dayOfWeek} ${entry.startTime}–${entry.endTime} at ${entry.venue || "TBA"}.`;
};

const notifyTimetableChange = async (entry, action) => {
  try {
    const classDoc = await Class.findById(entry.classId).populate("students");
    if (!classDoc || !classDoc.students?.length) return;

    const studentIds = classDoc.students;
    const students = await User.find({ _id: { $in: studentIds } }).select(
      "name email phoneNumber fcmToken notificationPreferences quietHours role"
    );
    if (!students.length) return;

    const lecturer = entry.lecturerId?.name || "Your lecturer";
    const title = action === "created" ? "New Class Scheduled" : "Timetable Updated";
    const message = buildMessage(entry, action, lecturer);
    const classLabel = classDoc.name || "";

    await Promise.allSettled(
      students.map(async (student) => {
        const prefs = student.notificationPreferences || {};
        const canSendNow = shouldSendNow(student, "medium");

        const tasks = [];

        const notifDoc = await NotificationLog.create({
          studentId: student._id,
          recipientId: student._id,
          title,
          message: `${message}\n\nClass: ${classLabel}`,
          type: "info",
          status: "unread",
          priority: "medium",
        });
        tasks.push(Promise.resolve(notifDoc));

        if (io) {
          io.to(`user:${student._id}`).emit("notification:new", {
            _id: notifDoc._id,
            title,
            body: message,
            message,
            type: "info",
            timestamp: new Date().toISOString(),
          });
        }

        if (student.fcmToken && prefs.push !== false && canSendNow) {
          tasks.push(
            sendPushNotification(student.fcmToken, {
              title,
              body: message.substring(0, 80),
            })
          );
        }

        if (student.email && prefs.email !== false && canSendNow) {
          tasks.push(
            getTransporter()
              .sendMail({
                from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
                to: student.email,
                subject: title,
                html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:8px;max-width:600px">
                  <h2 style="color:#1e40af;margin-top:0">${escapeHTML(title)}</h2>
                  <p>Dear <strong>${escapeHTML(student.name || "Student")}</strong>,</p>
                  <div style="background:#f1f5f9;padding:16px;border-left:4px solid #3b82f6;border-radius:4px;margin:12px 0">
                    <p style="margin:0 0 8px;color:#1e293b">${escapeHTML(message)}</p>
                    <p style="margin:0;font-size:13px;color:#64748b">
                      <strong>Class:</strong> ${escapeHTML(classLabel)}<br>
                      <strong>Day:</strong> ${entry.dayOfWeek}<br>
                      <strong>Time:</strong> ${entry.startTime} – ${entry.endTime}<br>
                      <strong>Venue:</strong> ${entry.venue || "TBA"}<br>
                      <strong>Lecturer:</strong> ${escapeHTML(lecturer)}
                    </p>
                  </div>
                  <p style="color:#64748b;font-size:12px">Check the app for your full weekly timetable.</p>
                </div>`,
              })
          );
        }

        if (student.phoneNumber && prefs.sms && canSendNow) {
          tasks.push(
            sendSMSViaTwilio(
              student.phoneNumber,
              `${title}: ${message.substring(0, 140)}`
            )
          );
        }

        await Promise.allSettled(tasks);
      })
    );
  } catch (err) {
    console.error("[TimetableNotify] Error notifying students:", err);
  }
};

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

// @desc    Create timetable entry + notify enrolled students
// @route   POST /api/timetable
// @access  Private (Admin, HOD)
export const createTimetable = asyncHandler(async (req, res) => {
  const { classId, lecturerId, dayOfWeek, startTime, endTime, venue, topic, recurringPattern } = req.body;

  const entry = await Timetable.create({
    classId,
    lecturerId,
    dayOfWeek,
    startTime,
    endTime,
    venue,
    topic,
    recurringPattern,
  });

  await entry.populate("classId", "code name");
  await entry.populate("lecturerId", "name email");

  notifyTimetableChange(entry, "created");

  res.status(201).json({ success: true, data: entry });
});

// @desc    Update timetable entry + notify enrolled students
// @route   PUT /api/timetable/:id
// @access  Private (Admin, HOD)
export const updateTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({ success: false, message: "Timetable entry not found" });
  }

  if (!["admin", "hod"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const updated = await Timetable.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("classId", "code name").populate("lecturerId", "name email");

  notifyTimetableChange(updated, "updated");

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
