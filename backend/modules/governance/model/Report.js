import mongoose from 'mongoose';

const lifecycleEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'created', 'submitted', 'under_review', 'approved',
      'rejected', 'revision_requested', 'acknowledged', 'escalated',
      'note_added', 'resubmitted',
    ],
    required: true,
  },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, required: true },
  actorName: { type: String },
  timestamp: { type: Date, default: Date.now },
  comments: { type: String, default: '' },
  previousStatus: { type: String },
  newStatus: { type: String },
}, { _id: false });

const metricEntrySchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  trend: { type: String, enum: ['up', 'down', 'stable', null], default: null },
  isAnomaly: { type: Boolean, default: false },
}, { _id: false });

const reportSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Report title is required'], trim: true },
  summary: { type: String, default: '' },

  reportingPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    label: { type: String },
  },

  metrics: [metricEntrySchema],

  notes: { type: String, default: '' },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],

  // ── LIFECYCLE ──
  status: {
    type: String,
    enum: [
      'draft', 'submitted', 'under_review',
      'approved', 'rejected', 'revision_requested',
      'acknowledged',
    ],
    default: 'draft',
  },

  // ── AUTHOR CONTEXT ──
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, required: true },
  authorName: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentName: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },

  // ── REVIEW ──
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  reviewComments: { type: String, default: '' },
  revisionRequest: { type: String, default: '' },

  // ── ACKNOWLEDGEMENT ──
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acknowledgedAt: { type: Date, default: null },

  // ── ESCALATION ──
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  escalatedAt: { type: Date, default: null },
  escalationReason: { type: String, default: '' },

  // ── LIFECYCLE HISTORY (immutable audit trail) ──
  lifecycle: [lifecycleEntrySchema],

  // ── RISK FLAGS ──
  riskFlags: [{
    severity: { type: String, enum: ['critical', 'warning', 'info'] },
    message: String,
    detectedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ departmentId: 1, status: 1 });
reportSchema.index({ 'lifecycle.timestamp': -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
