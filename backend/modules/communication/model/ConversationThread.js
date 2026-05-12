import mongoose from "mongoose";

const conversationThreadSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  participantRoles: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String }
  }],
  threadType: { type: String, enum: [
    'direct', 'group', 'office_ticket', 'structured_request',
    'course_discussion', 'announcement_reply', 'escalation', 'contextual'
  ], default: 'direct' },
  context: {
    type: { type: String, enum: [
      'course', 'class', 'department', 'school', 'college',
      'office', 'ticket', 'request', 'event', 'announcement',
      'escalation', 'general'
    ]},
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    url: { type: String }
  },
  category: { type: String, enum: [
    'academic', 'administrative', 'support', 'social', 'emergency', 'general'
  ], default: 'general' },
  urgency: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  visibility: { type: String, enum: ['visible', 'restricted', 'confidential'], default: 'visible' },
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  escalationLevel: { type: Number, default: 0 },
  escalationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Escalation' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date },
  messageCount: { type: Number, default: 0 },
  unreadCount: { type: Map, of: Number, default: {} },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  isMuted: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String }
}, { timestamps: true });

conversationThreadSchema.index({ participants: 1, updatedAt: -1 });
conversationThreadSchema.index({ 'context.type': 1, 'context.id': 1 });
conversationThreadSchema.index({ threadType: 1, updatedAt: -1 });
conversationThreadSchema.index({ office: 1 });
conversationThreadSchema.index({ escalationLevel: 1 });
conversationThreadSchema.index({ isArchived: 1, participants: 1 });
conversationThreadSchema.index({ category: 1, createdAt: -1 });
conversationThreadSchema.index({ urgency: 1 });

export default mongoose.model("ConversationThread", conversationThreadSchema);
