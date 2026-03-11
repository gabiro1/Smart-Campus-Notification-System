import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // Who is receiving this?
    targetUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false // If null, it means it's a role-based broadcast
    },
    targetRole: {
        type: String, // e.g., 'dean', 'hod', 'student'
        required: false 
    },
    
    // The Content
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success', 'action'],
        default: 'info'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // Actionable Link (Optional - e.g., clicking takes them to an event)
    link: { type: String },
    
    // Tracking
    isRead: { type: Boolean, default: false }

}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;