import mongoose from "mongoose";

const communicationLogSchema = new mongoose.Schema({
  event: { type: String, enum: [
    'message_sent', 'message_read', 'message_deleted',
    'conversation_created', 'conversation_archived',
    'ticket_created', 'ticket_updated', 'ticket_assigned',
    'request_submitted', 'request_approved', 'request_rejected',
    'escalation_created', 'escalation_level_up',
    'contact_lookup', 'report_generated',
    'flag_raised', 'moderation_action',
    'permission_denied', 'rate_limit_exceeded'
  ], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  outcome: { type: String, enum: ['success', 'failure', 'blocked'] },
  failureReason: { type: String }
}, { timestamps: true });

communicationLogSchema.index({ actor: 1, createdAt: -1 });
communicationLogSchema.index({ event: 1, createdAt: -1 });
communicationLogSchema.index({ targetType: 1, targetId: 1 });
communicationLogSchema.index({ createdAt: -1 });
communicationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model("CommunicationLog", communicationLogSchema);
