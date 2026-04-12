import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['system', 'ai', 'notifications', 'sms']
  },
  data: {
    aiAutoApprove: { type: Boolean, default: false },
    aiStrictness: { type: Number, default: 75, min: 0, max: 100 },
    requireHodApproval: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maxBroadcastReach: { type: String, default: 'all' },
    smsQuota: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 10000 }
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('SystemSettings', systemSettingsSchema);