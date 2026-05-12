import mongoose from "mongoose";

const contactRelationshipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relationshipType: { type: String, enum: [
    'course_lecturer', 'course_student', 'classmate',
    'department_member', 'school_member', 'class_rep',
    'hod', 'dean', 'principal', 'office_staff',
    'guild_representative', 'admin', 'escalation_target'
  ], required: true },
  contextSource: { type: String, enum: [
    'class', 'course', 'department', 'school', 'college', 'office', 'escalation'
  ], required: true },
  contextId: { type: mongoose.Schema.Types.ObjectId },
  contextName: { type: String },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  expiresAt: { type: Date }
}, { timestamps: true });

contactRelationshipSchema.index({ user: 1, isActive: 1, priority: -1 });
contactRelationshipSchema.index({ user: 1, contact: 1, relationshipType: 1 }, { unique: true });
contactRelationshipSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("ContactRelationship", contactRelationshipSchema);
