import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    unique: true,
    trim: true,
    // Example: 'College of Science and Technology'
  },
  code: {
    type: String,
    required: [true, 'College code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    // Example: 'CST'
  },
  principal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to your User model for the head of the college
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt fields
});

export default mongoose.model('College', collegeSchema);