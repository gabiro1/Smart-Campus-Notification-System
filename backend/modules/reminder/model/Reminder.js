import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  note: String,
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  category: {
    type: String,
    enum: ["general", "event", "academic", "assignment", "exam", "personal"],
    default: "general"
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "category"
  },
  completed: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Reminder", ReminderSchema);