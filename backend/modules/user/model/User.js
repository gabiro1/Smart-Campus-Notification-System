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
    enum: ["student", "lecturer", "hod", "guild_president", "admin", "dean", "principal", "class_rep", "hr", "registrar"],
    default: "student",
    index: true
  },

  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },

  // ==========================================
  // GUILD COUNCIL POSITION (e.g. "Guild President", "Secretary")
  // Assigned directly by admin via registration number. Holding the
  // "Guild President" position also elevates `role` to 'guild_president'.
  // ==========================================
  guildPosition: {
    type: String,
    default: null,
    trim: true,
    index: true
  },

  loginAttempts: {
    type: Number,
    default: 0,
    min: 0
  },

  lockedUntil: {
    type: Date,
    default: null
  },

  mustChangePassword: {
    type: Boolean,
    default: false
  },

  lastPasswordChangeAt: {
    type: Date,
    default: null
  },

  status: {
    type: String,
    enum: ["DRAFT", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"],
    default: "ACTIVE",
    index: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  studentID: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined for staff while keeping uniqueness for students
    trim: true
  },

  // ==========================================
  // CLASS REPRESENTATIVE FIELDS (NEW)
  // ==========================================
  // These fields are conditionally required when role === 'class_rep'
  representedLevel: {
    type: String,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    // Only required for class representatives
    required: function() {
      return this.role === 'class_rep';
    }
  },
  representedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    // Only required for class representatives
    required: function() {
      return this.role === 'class_rep';
    }
  },

  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  notificationPreferences: {
    // Global channel toggles (apply to all categories unless overridden)
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    // Category-specific channel maps
    categories: {
      events: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      reminders: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      governance: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    }
  },

  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },

  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // JWT Refresh Tokens
  refreshToken: String,

  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Digest Summary Caching
  lastDigestSummary: {
    type: String,
    default: null
  },
  lastDigestAt: {
    type: Date,
    default: null
  },
  digestEnabled: {
    type: Boolean,
    default: true
  },

  // ONBOARDING STATUS
  hasCompletedOnboarding: {
    type: Boolean,
    default: false,
    index: true // Quick lookup for onboarding check
  },

  // QUIET HOURS (for notification suppression)
  // Format: "HH:MM" (24-hour format, e.g., "22:00", "07:00")
  // If null/undefined, no quiet hours enforced.
  quietHours: {
    startTime: { type: String, default: null },
    endTime: { type: String, default: null }
  },

  // LANGUAGE PREFERENCE for AI Translation
  // 'en' = English (default), 'rw' = Kinyarwanda
  languagePreference: {
    type: String,
    enum: ['en', 'rw'],
    default: 'en'
  },

  // ==========================================
  // STUDENT ENGAGEMENT FIELDS
  // ==========================================
  // Attendance rate for events (percentage 0-100)
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Array of bookmarked/saved event IDs
  savedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],

  // Array of bookmarked/saved announcement IDs
  savedAnnouncements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement'
  }]

  // NOTE: 'interests' field already exists at line 61: [{ type: String, trim: true }]
  // This array stores user's selected interest topics (tech, sports, seminars, etc.)
}, {
  timestamps: true
});

// COMPOUND INDEX: Since HODs constantly query for specific roles within their department
userSchema.index({ role: 1, department: 1 });

const User = mongoose.model("User", userSchema);
export default User;