import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConversationThread',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: { type: String, required: true },
  recipientType: { type: String, enum: [
    'individual', 'office', 'role_group', 'course_group'
  ], default: 'individual' },
  recipientId: { type: mongoose.Schema.Types.ObjectId },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "document", "poll",
           "system", "escalation_notice", "status_update", "approval"],
    default: "text"
  },
  content: { type: String, trim: true },
  file: {
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  },
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }]
  },
  isRead: { type: Boolean, default: false },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date }
  }],
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },
  moderationAction: { type: String, enum: ['none', 'warning', 'hidden', 'removed'] },
  aiClassified: { type: Boolean, default: false },
  aiClassification: {
    category: { type: String },
    intent: { type: String },
    urgency: { type: String },
    sentiment: { type: String },
    confidence: { type: Number }
  },
  deliveryStatus: { type: String, enum: [
    'sent', 'delivered', 'read', 'failed'
  ], default: 'sent' },
  deliveredAt: { type: Date },
  readAt: { type: Date }
}, { timestamps: true });

messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientType: 1, recipientId: 1 });
messageSchema.index({ isFlagged: 1 });
messageSchema.index({ deliveryStatus: 1 });

export default mongoose.model("Message", messageSchema);
