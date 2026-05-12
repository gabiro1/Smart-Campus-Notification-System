import mongoose from "mongoose";

const escalationSchema = new mongoose.Schema({
  escalationNumber: { type: String, required: true, unique: true },
  sourceType: { type: String, enum: ['ticket', 'request', 'message', 'conversation'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  chain: [{
    fromLevel: { type: Number, required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromRole: { type: String },
    toLevel: { type: Number, required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toRole: { type: String },
    reason: { type: String },
    escalatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'resolved'], default: 'pending' },
    note: { type: String }
  }],
  currentLevel: { type: Number, default: 1 },
  maxLevel: { type: Number },
  timeoutHours: { type: Number, default: 48 },
  timeoutAt: { type: Date },
  isTimedOut: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'resolved', 'cancelled', 'max_level_reached'], default: 'active' },
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  initiatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

escalationSchema.index({ sourceType: 1, sourceId: 1 });
escalationSchema.index({ status: 1, currentLevel: 1 });
escalationSchema.index({ timeoutAt: 1, isTimedOut: 1 });

escalationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Escalation').countDocuments();
    this.escalationNumber = `ESC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model("Escalation", escalationSchema);
