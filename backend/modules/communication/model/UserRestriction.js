import mongoose from "mongoose";

const userRestrictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restrictionType: { type: String, enum: [
    'message_restricted', 'ticket_restricted', 'request_restricted',
    'fully_restricted', 'read_only'
  ]},
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
  durationHours: { type: Number },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userRestrictionSchema.index({ user: 1, isActive: 1 });
userRestrictionSchema.index({ expiresAt: 1 });

export default mongoose.model("UserRestriction", userRestrictionSchema);
