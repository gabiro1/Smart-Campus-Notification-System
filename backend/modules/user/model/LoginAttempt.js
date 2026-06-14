import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: false });

loginAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 });
loginAttemptSchema.index({ email: 1, attemptedAt: -1 });

loginAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('LoginAttempt', loginAttemptSchema);
