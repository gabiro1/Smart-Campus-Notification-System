import mongoose from 'mongoose';

const roleAssignmentSchema = new mongoose.Schema({
  staffDraft: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffDraft', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  targetRole: {
    type: String,
    enum: ['lecturer', 'hod', 'dean', 'principal', 'registrar'],
    required: true
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVATED'],
    default: 'PENDING'
  },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterRole: { type: String, required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  activatedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  approvalChain: [{
    role: String,
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

roleAssignmentSchema.index({ status: 1, createdAt: -1 });
roleAssignmentSchema.index({ requester: 1, status: 1 });

export default mongoose.model('RoleAssignment', roleAssignmentSchema);
