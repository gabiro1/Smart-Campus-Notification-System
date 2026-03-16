import mongoose from "mongoose";

// The schema for questions/comments asked under an announcement
const commentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  isResolved: { 
    type: Boolean, 
    default: false 
  }, // The lecturer (or AI later) can mark a good question as "Resolved"
}, { timestamps: true });

// The main announcement schema
const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  lecturer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // ---> THE MISSING PIECE WE JUST ADDED <---
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  
  targetClass: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class", 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["General", "Urgent", "Assignment", "Event"], 
    default: "General" 
  },
  attachments: [{ 
    type: String // URLs to PDFs, images, etc.
  }],
  comments: [commentSchema], // Embedding the comments directly here
  viewedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }] // Tracks which students actually read it!
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;