import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  code: { 
    type: String, 
    required: true, 
    uppercase: true 
    // REMOVED unique: true from here!
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  lecturer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

// THE FIX: A lecturer can teach "CS401" to different classes, 
// but "CS401" can only exist ONCE inside "Year 4 IT"
courseSchema.index({ code: 1, class: 1 }, { unique: true });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;