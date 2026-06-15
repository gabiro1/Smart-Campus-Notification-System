import mongoose from "mongoose";

const structuredRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  requestType: { type: String, required: true, enum: [
    'missing_marks', 'appeal', 'hostel_issue', 'course_registration',
    'clearance', 'technical_support', 'recommendation_letter',
    'transcript_request', 'transfer_request', 'deferment', 'other'
  ]},
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submitterInfo: {
    name: { type: String },
    registrationNumber: { type: String },
    email: { type: String },
    phone: { type: String },
    department: { type: String },
    level: { type: String }
  },
  formData: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  targetOffice: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  targetRole: { type: String },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: [
    'draft', 'submitted', 'under_review', 'approved',
    'rejected', 'more_info_needed', 'cancelled'
  ], default: 'submitted' },
  statusHistory: [{
    from: { type: String },
    to: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    comment: { type: String }
  }],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  attachments: [{
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  }],
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationThread' },
  isEscalated: { type: Boolean, default: false },
  escalationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Escalation' }
}, { timestamps: true });

structuredRequestSchema.index({ requestType: 1, status: 1 });
structuredRequestSchema.index({ submittedBy: 1, createdAt: -1 });
structuredRequestSchema.index({ targetOffice: 1, status: 1 });

structuredRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('StructuredRequest').countDocuments();
    this.requestNumber = `REQ-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model("StructuredRequest", structuredRequestSchema);
