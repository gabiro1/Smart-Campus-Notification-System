import mongoose from 'mongoose';

const EventStatusHistorySchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  fromStatus: { type: String },
  toStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedByRole: { type: String },
  reason: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

EventStatusHistorySchema.index({ event: 1, createdAt: -1 });
EventStatusHistorySchema.index({ changedBy: 1 });
EventStatusHistorySchema.index({ toStatus: 1 });

export default mongoose.model('EventStatusHistory', EventStatusHistorySchema);
