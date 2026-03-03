// models/Event.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: Date,
    targetSchool: String,
    targetDept: String,
    targetLevel: Number,
    tags: [String],
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
        enum: ['department', 'school', 'college', 'none'], // none = auto-approved
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