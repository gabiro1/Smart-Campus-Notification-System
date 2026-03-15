import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    unique: true,
    trim: true,
    // Example: 'School of Information and Communication Technology'
  },
  code: {
    type: String,
    required: [true, 'School code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    // Example: 'SICT'
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College', // Links directly to the parent College
    required: [true, 'A School must belong to a College']
  },
  dean: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to your User model for the head of the school
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('School', schoolSchema);