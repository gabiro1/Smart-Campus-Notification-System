import mongoose from 'mongoose';

const EventReviewSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'PUBLISHED', 'CANCELLED', 'ESCALATED', 'OVERRIDDEN'],
    required: true
  },
  comment: { type: String, default: '' },
  previousStatus: { type: String },
  newStatus: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

EventReviewSchema.index({ event: 1, createdAt: -1 });
EventReviewSchema.index({ reviewer: 1 });
EventReviewSchema.index({ action: 1 });

export default mongoose.model('EventReview', EventReviewSchema);
