import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: Date,
    time: String,
    location: String,
    posterUrl: String,
    targetSchool: String,
    targetDept: String,
    targetLevel: Number,
    // ─ CLASS REP SCOPE FIELDS ───────────────────────────────────────────
    // Populated automatically by classRepPulseEventScope middleware.
    // Other roles leave these null; targeted queries fall back to targetDept/targetSchool.
    targetScope: {
        type: String,
        enum: ['class', 'department', 'school', 'college', 'university'],
        default: null
    },
    // ObjectId reference — matches User.representedDepartment
    targetDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    tags: [String],
    isEmergency: { type: Boolean, default: false }, // NEW for Pulse Broadcast
    attachmentUrl: String, // NEW for Pulse Broadcast PDF
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // --- GOVERNANCE FIELDS ---
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    approvalLevel: { 
        type: String, 
        enum: ['department', 'school', 'college', 'none'], 
        default: 'none'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    
    ratings: [{
        studentId: mongoose.Schema.Types.ObjectId,
        rating: { type: Number, min: 1, max: 5 }
    }]
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);