import mongoose from 'mongoose';

const staffDraftSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phoneNumber: { type: String, trim: true },
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
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVATED'],
    default: 'DRAFT'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  assignmentRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RoleAssignment', default: null },
  activatedAt: { type: Date, default: null },
}, { timestamps: true });

staffDraftSchema.index({ status: 1, createdBy: 1 });
staffDraftSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('StaffDraft', staffDraftSchema);
