import mongoose from "mongoose";

const officeStaffSchema = new mongoose.Schema({
  office: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['manager', 'agent', 'viewer'], default: 'agent' },
  isActive: { type: Boolean, default: true },
  maxActiveTickets: { type: Number, default: 10 },
  specialties: [{ type: String }],
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

officeStaffSchema.index({ office: 1, user: 1 }, { unique: true });
officeStaffSchema.index({ user: 1 });

export default mongoose.model("OfficeStaff", officeStaffSchema);
