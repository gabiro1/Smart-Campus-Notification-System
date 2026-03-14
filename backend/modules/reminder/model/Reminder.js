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
  note: String, // Changed from description to note to match Frontend
  dueDate: {    // Changed from deadline to dueDate to match Frontend
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"], // Changed to match Frontend capitalization
    default: "Low"
  },
  completed: {
    type: Boolean,
    default: false
  },
  notified: { // Matches the notification tracking in your Frontend useEffect
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Reminder", ReminderSchema);