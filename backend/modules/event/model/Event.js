import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  // --- ORGANIZER ---
  organizerName: { type: String, required: true },
  organizerRole: { type: String, required: true },
  departmentClub: { type: String, default: '' },

  // --- CATEGORY ---
  category: {
    type: String,
    enum: [
      'academic', 'cultural', 'sports', 'social',
      'workshop', 'seminar', 'meeting', 'ceremony',
      'competition', 'fundraiser', 'orientation', 'other'
    ],
    default: 'other'
  },

  // --- SCHEDULE ---
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  startTime: { type: String, required: true },
  endTime: { type: String, default: '' },
  venue: { type: String, required: true },

  // --- AUDIENCE TARGETING ---
  targetAudience: {
    type: [String],
    enum: [
      'whole_university', 'specific_college', 'specific_school', 'department',
      'academic_year', 'clubs', 'staff_only', 'invite_only'
    ],
    default: ['whole_university']
  },
  targetColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
  targetSchools: [{ type: mongoose.Schema.Types.ObjectId, ref: 'School' }],
  targetDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  targetAcademicYears: [{ type: String, enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'] }],
  targetClubs: [{ type: String }],

  expectedAttendance: { type: Number, default: 0 },
  contactInfo: { type: String, default: '' },

  // --- EXTERNAL LINKS ---
  externalRegistrationLink: { type: String, default: '' },
  livestreamLink: { type: String, default: '' },

  // --- OPTIONAL FEATURES ---
  budgetRequest: { type: Number, default: 0 },
  attendanceTracking: { type: Boolean, default: false },
  qrCheckIn: { type: Boolean, default: false },
  visibilitySettings: {
    type: String,
    enum: ['public', 'restricted', 'invite_only'],
    default: 'public'
  },

  // --- NOTES ---
  notesToReviewers: { type: String, default: '' },

  // --- POSTER / ATTACHMENTS ---
  posterUrl: { type: String, default: '' },

  // --- STATUS & WORKFLOW ---
  status: {
    type: String,
    enum: [
      'DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW',
      'NEEDS_REVISION', 'APPROVED', 'REJECTED',
      'SCHEDULED', 'PUBLISHED', 'CANCELLED', 'EXPIRED'
    ],
    default: 'DRAFT'
  },
  rejectionReason: { type: String, default: '' },
  revisionNotes: { type: String, default: '' },

  // --- RBAC ---
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // --- EXISTING LEGACY FIELDS (for backward compatibility) ---
  date: Date,
  time: String,
  location: String,
  targetSchool: String,
  targetDept: String,
  targetLevel: Number,
  targetScope: {
    type: String,
    enum: ['class', 'department', 'school', 'college'],
    default: null
  },
  targetDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  tags: [String],
  isEmergency: { type: Boolean, default: false },
  attachmentUrl: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  approvalLevel: {
    type: String,
    enum: ['department', 'school', 'college', 'none'],
    default: 'none'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ratings: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
  }],
  checkedInBy: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentIdentifier: String,
    checkedInAt: { type: Date, default: Date.now }
  }],
  aiMetadata: {
    usedAI: { type: Boolean, default: false },
    fallbackReason: { type: String, default: null },
    aiCategory: { type: String, default: null },
    aiUrgency: { type: String, default: null },
    classifiedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

EventSchema.index({ title: 'text', description: 'text', tags: 'text' });
EventSchema.index({ status: 1, createdAt: -1 });
EventSchema.index({ createdBy: 1, status: 1 });
EventSchema.index({ venue: 1, startDate: 1, status: 1 });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ category: 1, status: 1 });

export default mongoose.model('Event', EventSchema);
