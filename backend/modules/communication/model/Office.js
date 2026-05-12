import mongoose from "mongoose";

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: [
    'academic', 'financial', 'technical', 'administrative',
    'student_affairs', 'accommodation', 'registrar', 'library', 'other'
  ], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  description: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  location: { type: String },
  operatingHours: {
    monday:    { open: String, close: String },
    tuesday:   { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday:  { open: String, close: String },
    friday:    { open: String, close: String }
  },
  escalationOffice: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
  slaHours: { type: Number, default: 48 },
  priorityLevel: { type: Number, min: 1, max: 5, default: 3 },
  isActive: { type: Boolean, default: true },
  metadata: { type: Map, of: String }
}, { timestamps: true });

officeSchema.index({ type: 1, isActive: 1 });
officeSchema.index({ department: 1 });

export default mongoose.model("Office", officeSchema);
