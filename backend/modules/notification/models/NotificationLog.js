import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
    // Renamed for generic flexibility. Could be an Event ID or an Announcement ID.
    // Removed strict `ref: 'Event'` to prevent population mismatch crashes.
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },

    // Who is receiving this? (legacy field)
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Generic recipient for all roles (staff, lecturers, HODs, etc.)
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
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
        trim: true
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

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    // EMERGENCY BROADCAST: Requires user acknowledgment
    requiresAcknowledgment: {
        type: Boolean,
        default: false
    },

    // When did the user acknowledge this notification?
    acknowledgedAt: {
        type: Date,
        default: null
    },

    // Tracks when this notification was included in a digest email/push
    digestedAt: {
        type: Date,
        default: null
    },

    receivedAt: Date,
    readAt: Date,

    // User-managed flags
    isPinned: {
        type: Boolean,
        default: false
    },
    isMuted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// ==========================================
// 🚀 ENTERPRISE INDEXING FOR HIGH PERFORMANCE
// ==========================================

// 1. Compound index for extremely fast "Get my unread notifications" queries
NotificationLogSchema.index({ studentId: 1, status: 1 });

// 2. Index for chronological sorting of a user's inbox
NotificationLogSchema.index({ studentId: 1, createdAt: -1 });

// 3. Digest queries: find unread low-priority notifications not yet digested
NotificationLogSchema.index({ studentId: 1, status: 1, priority: 1, digestedAt: 1 });

// 4. Batch update index for marking notifications as digested
NotificationLogSchema.index({ studentId: 1, digestedAt: 1 });

// 5. Emergency acknowledgment queries: find unacknowledged required acknowledgments
NotificationLogSchema.index({ studentId: 1, requiresAcknowledgment: 1, acknowledgedAt: 1 });

// 6. Admin analytics: count acknowledgments per notification
NotificationLogSchema.index({ referenceId: 1, requiresAcknowledgment: 1, acknowledgedAt: 1 });

export default mongoose.model('NotificationLog', NotificationLogSchema);