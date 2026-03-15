import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    // Example: 'Information Technology'
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    // Example: 'IT'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School', // Links to the parent School
    required: [true, 'A Department must belong to a School']
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the User model for the Head of Department
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
export default Department;