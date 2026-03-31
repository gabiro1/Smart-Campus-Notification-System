import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
    // Renamed for generic flexibility. Could be an Event ID or an Announcement ID.
    // Removed strict `ref: 'Event'` to prevent population mismatch crashes.
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: false 
    },
    
    // Who is receiving this? 
    // (Consider renaming to 'recipientId' in the future if staff also receive alerts)
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // Who sent this?
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    }, 
    
    title: { 
        type: String, 
        default: 'Department Notification',
        trim: true // Always trim whitespace in production
    }, 
    
    message: { 
        type: String, 
        required: true,
        trim: true
    },
    
    type: { 
        type: String, 
        enum: ['info', 'warning', 'success', 'event', 'action', 'announcement'], 
        default: 'info' 
    },
    
    status: { 
        type: String, 
        enum: ['sent', 'delivered', 'read', 'unread'], 
        default: 'unread' 
    },
    
    receivedAt: Date,
    readAt: Date
}, { timestamps: true });

// ==========================================
// 🚀 ENTERPRISE INDEXING FOR HIGH PERFORMANCE
// ==========================================

// 1. Compound index for extremely fast "Get my unread notifications" queries
NotificationLogSchema.index({ studentId: 1, status: 1 });

// 2. Index for chronological sorting of a user's inbox
NotificationLogSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model('NotificationLog', NotificationLogSchema);