import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'], // e.g., "Final Year Project Preparation"
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Course code is required'], // e.g., "IT400"
    unique: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'A class must belong to a department']
  },
  lecturers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Array of lecturers assigned to this specific module
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Array of all students enrolled in the class
  }],
  level: {
    type: String,
    required: true,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'], // Specific to UR levels
    default: 'Year 4'
  },
  academicYear: {
    type: String,
    required: true, // e.g., "2025-2026"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Class', classSchema);