import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isResolved: { type: Boolean, default: false }, 
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  targetClass: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  type: {
    type: String,
    enum: ["General", "Urgent", "Assignment", "Event"],
    default: "General"
  },

  // ---> THE NEW UPGRADE: Lifecycle Status <---
  status: {
    type: String,
    enum: ["Draft", "Scheduled", "Active", "Archived"],
    default: "Active" // By default, new posts go live immediately unless scheduled
  },

  // Scheduling: If set, announcement will be automatically dispatched at this time
  scheduledAt: {
    type: Date,
    default: null
  },

  attachments: [{ type: String }],
  comments: [commentSchema],
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // AI Classification metadata (non-breaking addition)
  // Stores results from classifyNotification() for analytics/debugging
  aiMetadata: {
    priority: { type: String, enum: ['low', 'medium', 'high'], default: null },
    tags: [{ type: String }],
    targetScope: { type: String, default: null },
    category: { type: String, default: null },
    reasoning: { type: String, default: null },
    usedAI: { type: Boolean, default: false },
    classifiedAt: { type: Date, default: Date.now }
  },

  // EMERGENCY BROADCAST: Requires user acknowledgment
  requiresAcknowledgment: {
    type: Boolean,
    default: false
  },

  // KINYARWANDA TRANSLATION CACHING
  // Stores AI-translated version to avoid re-translating for each student
  titleRw: {
    type: String,
    default: null
  },
  bodyRw: {
    type: String,
    default: null
  },

  // Metadata: when was the translation last updated?
  translatedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Text indexes for natural language search
announcementSchema.index({ title: 'text', content: 'text' });
announcementSchema.index({
  title: 'text',
  content: 'text',
  'course.code': 1, // for filtering by course
  createdAt: -1
});

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;