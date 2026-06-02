import mongoose from 'mongoose';

const EventNotificationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['STATUS_CHANGE', 'REVIEW_REQUEST', 'APPROVED', 'REJECTED',
           'REVISION_REQUESTED', 'PUBLISHED', 'CANCELLED', 'CONFLICT_ALERT'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  channel: { type: String, enum: ['in_app', 'email', 'push'], default: 'in_app' },
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date }
}, { timestamps: true });

EventNotificationSchema.index({ event: 1, recipient: 1 });
EventNotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
EventNotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('EventNotification', EventNotificationSchema);
