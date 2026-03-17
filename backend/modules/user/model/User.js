// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // SECURITY FIX: select: false prevents password hashes from leaking in API responses
  password: { type: String, required: true, select: false }, 
  profilePicture: { type: String, default: "" },
  phoneNumber: String,
  
  // ACADEMIC HIERARCHY
  college: String, 
  school: String,
  department: String,
  level: String,
  
  // UNIFIED NAMING: We use classId everywhere now
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
  },
  
  interests: [String],
  interestWeights: {
    type: Map,
    of: Number,
    default: new Map()
  },
  fcmToken: String,
  role: {
    type: String,
    enum: ["student", "lecturer", "hod", "guild_president", "admin", "dean", "principal"],
    default: "student"
  },
  studentID: {
    type: String,
    unique: true,
    sparse: true 
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  notificationPreferences: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;