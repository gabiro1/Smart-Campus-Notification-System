import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ""
  },
  sourceType: {
    type: String,
    enum: ["event", "exam", "assignment", "meeting", "admin_deadline", "personal"],
    default: "personal"
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "scheduled", "processing", "sent", "failed", "cancelled"],
    default: "pending"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly", null],
    default: null
  },
  recurrenceEnd: {
    type: Date,
    default: null
  },
  deliveryChannels: {
    inApp: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  targetAudience: {
    type: String,
    enum: ["self", "class", "department", "school", "college"],
    default: "self"
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

ReminderSchema.index({ status: 1, scheduledTime: 1 });
ReminderSchema.index({ createdBy: 1, status: 1 });
ReminderSchema.index({ sourceType: 1, sourceId: 1 });
ReminderSchema.index({ dueDate: 1 });

export default mongoose.model("Reminder", ReminderSchema);
