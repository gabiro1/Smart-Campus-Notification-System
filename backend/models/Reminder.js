import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  // Reference to the student who created the reminder
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Reminder details
  title: {
    type: String,
    required: true
  },

  description: String,

  // When the reminder should trigger
  deadline: {
    type: Date,
    required: true
  },

  // Priority level
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  // Completion tracking
  completed: {
    type: Boolean,
    default: false
  },

  completedAt: Date,

  // Category/Type (e.g., "assignment", "exam", "event", "project")
  category: String,

  // Whether a notification has been sent
  notificationSent: {
    type: Boolean,
    default: false
  },

  notificationSentAt: Date
}, { timestamps: true });

// Index for efficient queries
ReminderSchema.index({ studentId: 1, deadline: 1 });
ReminderSchema.index({ studentId: 1, completed: 1 });

export default mongoose.model("Reminder", ReminderSchema);
