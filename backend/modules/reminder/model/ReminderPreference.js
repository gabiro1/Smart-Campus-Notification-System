import mongoose from "mongoose";

const ReminderPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  inAppEnabled: {
    type: Boolean,
    default: true
  },
  pushEnabled: {
    type: Boolean,
    default: true
  },
  emailEnabled: {
    type: Boolean,
    default: false
  },
  smsEnabled: {
    type: Boolean,
    default: false
  },
  reminderFrequency: {
    type: String,
    enum: ["at_time", "5min", "15min", "30min", "1hour", "2hours", "1day", "1week"],
    default: "at_time"
  },
  quietHoursStart: {
    type: String,
    default: null
  },
  quietHoursEnd: {
    type: String,
    default: null
  },
  maxDailyReminders: {
    type: Number,
    default: 50
  },
  categories: {
    event: { type: Boolean, default: true },
    exam: { type: Boolean, default: true },
    assignment: { type: Boolean, default: true },
    meeting: { type: Boolean, default: true },
    admin_deadline: { type: Boolean, default: true },
    personal: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model("ReminderPreference", ReminderPreferenceSchema);
