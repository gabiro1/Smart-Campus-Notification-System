import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  type: { type: String, enum: ["ai", "lecturer"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const qaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  replies: [replySchema]
}, { timestamps: true });

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

  status: {
    type: String,
    enum: ["Draft", "Scheduled", "Active", "Archived"],
    default: "Active"
  },

  scheduledAt: {
    type: Date,
    default: null
  },

  attachments: [{ type: String }],
  comments: [commentSchema],
  qa: [qaSchema],
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  aiMetadata: {
    priority: { type: String, enum: ['low', 'medium', 'high'], default: null },
    tags: [{ type: String }],
    targetScope: { type: String, default: null },
    category: { type: String, default: null },
    reasoning: { type: String, default: null },
    usedAI: { type: Boolean, default: false },
    classifiedAt: { type: Date, default: Date.now }
  },

  requiresAcknowledgment: {
    type: Boolean,
    default: false
  },

  titleRw: { type: String, default: null },
  bodyRw: { type: String, default: null },
  translatedAt: { type: Date, default: null }
}, { timestamps: true });

announcementSchema.index({ title: 'text', content: 'text' });
announcementSchema.index({
  title: 'text',
  content: 'text',
  'course.code': 1,
  createdAt: -1
});

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;