import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  ticketType: { type: String, enum: ['support', 'request', 'complaint', 'inquiry', 'escalation'], default: 'support' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submitterRole: { type: String, required: true },
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  subject: { type: String, required: true, maxLength: 200 },
  description: { type: String, required: true, maxLength: 5000 },
  category: { type: String },
  subcategory: { type: String },
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  slaDeadline: { type: Date },
  slaBreached: { type: Boolean, default: false },
  slaBreachedAt: { type: Date },
  status: { type: String, enum: [
    'new', 'assigned', 'in_progress', 'awaiting_reply',
    'pending', 'resolved', 'closed', 'reopened'
  ], default: 'new' },
  statusHistory: [{
    from: { type: String },
    to: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  queuePosition: { type: Number, default: 0 },
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionTime: { type: Number },
  isEscalated: { type: Boolean, default: false },
  escalationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Escalation' },
  escalatedAt: { type: Date },
  attachments: [{
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  internalNotes: [{
    content: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionFeedback: { type: String },
  satisfactionSubmittedAt: { type: Date },
  aiClassified: { type: Boolean, default: false },
  aiRecommendation: {
    recommendedOffice: { type: String },
    recommendedPriority: { type: String },
    confidence: { type: Number },
    suggestedCategory: { type: String }
  },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationThread' }
}, { timestamps: true });

ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ office: 1, status: 1 });
ticketSchema.index({ submittedBy: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ priority: 1, status: 1, slaDeadline: 1 });
ticketSchema.index({ isEscalated: 1, escalatedAt: 1 });
ticketSchema.index({ status: 1, queuePosition: 1 });

ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model("Ticket", ticketSchema);
