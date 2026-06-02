import mongoose from 'mongoose';

const EventAttachmentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  isPoster: { type: Boolean, default: false },
}, { timestamps: true });

EventAttachmentSchema.index({ event: 1 });
EventAttachmentSchema.index({ uploadedBy: 1 });

export default mongoose.model('EventAttachment', EventAttachmentSchema);
