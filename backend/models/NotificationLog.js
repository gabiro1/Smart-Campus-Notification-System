import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
    // Optional: Only used if this notification is about a specific event
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
    
    // Who is receiving this?
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // NEW: Direct content for the Bell Icon
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'event', 'action'], default: 'info' },

    status: { type: String, enum: ['sent', 'delivered', 'read', 'unread'], default: 'unread' },
    receivedAt: Date,
    readAt: Date
}, { timestamps: true });

export default mongoose.model('NotificationLog', NotificationLogSchema);