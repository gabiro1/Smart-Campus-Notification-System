import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: Date,
    targetSchool: String,
    targetDept: String,
    targetLevel: Number,
    tags: [String], // Used by ML to match with User interestWeights
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    // AI Layer: Track student feedback
    ratings: [{
        studentId: mongoose.Schema.Types.ObjectId,
        rating: { type: Number, min: 1, max: 5 }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);