import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  }
}, { timestamps: true });

// Prevent duplicate bookmarks by enforcing a unique compound index
BookmarkSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('Bookmark', BookmarkSchema);
