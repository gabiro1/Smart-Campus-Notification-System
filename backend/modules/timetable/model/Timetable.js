import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    index: true
  },
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  dayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true
  },
  startTime: {
    type: String, // HH:MM format (e.g., "09:00")
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  recurringPattern: {
    type: String,
    enum: ["weekly", "biweekly", "monthly", "none"],
    default: "weekly"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries for same class/lecturer/time
TimetableSchema.index({ classId: 1, lecturerId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

export default mongoose.model("Timetable", TimetableSchema);
