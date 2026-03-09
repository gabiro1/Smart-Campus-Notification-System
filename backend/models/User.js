import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  phoneNumber: String,
  school: String,
  department: String,
  level: String,
  interests: [String],

  // AI System: Track weighted interests for personalized ranking
  interestWeights: {
    type: Map,
    of: Number,
    default: new Map()
  },

  // Firebase Cloud Messaging: Device token for push notifications
  fcmToken: String,

  role: {
    type: String,
    enum: ["student", "lecturer", "hod", "guild_president", "admin", "dean", "principal", "guild_president"],
    default: "student"
  },

  // Track when user was last active
  lastActiveAt: {
    type: Date,
    default: Date.now
  },

  // Notification preferences
  notificationPreferences: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
