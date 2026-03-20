import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  // SECURITY FIX: select: false prevents password hashes from leaking in API responses
  password: { 
    type: String, 
    required: true, 
    select: false 
  }, 
  profilePicture: { 
    type: String, 
    default: "" 
  },
  phoneNumber: { 
    type: String, 
    trim: true 
  },
  
  // ==========================================
  // ACADEMIC HIERARCHY (STRICTLY RELATIONAL)
  // ==========================================
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true
  }, 
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    index: true // CRITICAL: Speeds up your HOD dashboard queries exponentially
  },
  level: {
    type: String,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
  },
  
  // UNIFIED NAMING: Links student to their specific module/class cohort
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class',
    index: true
  },
  
  interests: [{ type: String, trim: true }],
  interestWeights: {
    type: Map,
    of: Number,
    default: new Map()
  },
  fcmToken: String,
  
  role: {
    type: String,
    enum: ["student", "lecturer", "hod", "guild_president", "admin", "dean", "principal"],
    default: "student",
    index: true 
  },
  studentID: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined for staff while keeping uniqueness for students
    trim: true
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
}, { 
  timestamps: true 
});

// COMPOUND INDEX: Since HODs constantly query for specific roles within their department
userSchema.index({ role: 1, department: 1 });

const User = mongoose.model("User", userSchema);
export default User;