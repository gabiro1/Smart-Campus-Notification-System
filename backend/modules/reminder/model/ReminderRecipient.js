import mongoose from "mongoose";

const ReminderRecipientSchema = new mongoose.Schema({
  reminderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reminder",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "sent", "delivered", "failed", "read"],
    default: "pending"
  },
  deliveryChannel: {
    type: String,
    enum: ["in_app", "push", "email", "sms", null],
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  attempts: [{
    channel: { type: String, enum: ["in_app", "push", "email", "sms"] },
    sentAt: { type: Date },
    status: { type: String, enum: ["sent", "delivered", "failed"] },
    error: { type: String, default: null }
  }]
}, { timestamps: true });

ReminderRecipientSchema.index({ reminderId: 1 });
ReminderRecipientSchema.index({ userId: 1, deliveryStatus: 1 });
ReminderRecipientSchema.index({ reminderId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ReminderRecipient", ReminderRecipientSchema);
