import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Tells us if it's text, an image, a PDF, a poll, etc.
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "document", "poll"],
    default: "text"
  },
  // The actual text message (or the caption for a file)
  content: {
    type: String,
    trim: true
  },
  // This object stores the link to the file once it's uploaded to Firebase
  file: {
    url: { type: String },       // The download link
    name: { type: String },      // e.g., "Lecture_Notes.pdf"
    size: { type: Number },      // File size in bytes
    mimeType: { type: String }   // e.g., "application/pdf"
  },
  // If the message is a Poll, it uses this section
  poll: {
    question: { type: String },
    options: [{
      text: { type: String },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }]
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("DirectMessage", messageSchema);