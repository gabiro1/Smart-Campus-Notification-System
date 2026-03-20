import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
    
    // Who is receiving this?
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // NEW: Who sent this? (Crucial for HOD History)
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
    
    // We'll give title a default so it doesn't crash if we forget to send it
    title: { type: String, default: 'Department Notification' }, 
    message: { type: String, required: true },
    
    type: { type: String, enum: ['info', 'warning', 'success', 'event', 'action'], default: 'info' },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'unread'], default: 'unread' },
    
    receivedAt: Date,
    readAt: Date
}, { timestamps: true });

export default mongoose.model('NotificationLog', NotificationLogSchema);