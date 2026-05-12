import mongoose from "mongoose";

const ROLES = ["student", "lecturer", "hod", "guild_president", "admin", "dean", "principal", "class_rep"];

const communicationPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  rolePair: {
    fromRole: { type: String, enum: ROLES, required: true },
    toRole: { type: String, enum: ROLES, required: true }
  },
  relationshipRequired: {
    type: { type: String, enum: [
      'course_enrollment', 'department_membership', 'school_membership',
      'hierarchy_chain', 'office_assignment', 'escalation', 'admin_override'
    ]},
    contextSource: { type: String, enum: [
      'class', 'course', 'department', 'school', 'college', 'office', 'ticket'
    ]}
  },
  messagingMode: { type: String, enum: [
    'direct', 'office_only', 'request_only', 'ticket_only', 'escalation_only', 'announcement_reply'
  ], default: 'direct' },
  requiresApproval: { type: Boolean, default: false },
  maxDailyMessages: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 }
}, { timestamps: true });

communicationPolicySchema.index({ 'rolePair.fromRole': 1, 'rolePair.toRole': 1 });
communicationPolicySchema.index({ isActive: 1 });

export default mongoose.model("CommunicationPolicy", communicationPolicySchema);
