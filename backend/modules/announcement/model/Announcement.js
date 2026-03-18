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
    enum: ["Active", "Draft", "Archived"],
    default: "Active" // By default, new posts go live immediately unless specified as Draft
  },

  attachments: [{ type: String }],
  comments: [commentSchema], 
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] 
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;