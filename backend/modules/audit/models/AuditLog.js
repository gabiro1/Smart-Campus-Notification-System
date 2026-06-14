import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            enum: [
                'CREATE_USER',
                'UPDATE_USER',
                'DELETE_USER',
                'PROMOTE_USER',
                'CREATE_EVENT',
                'UPDATE_EVENT',
                'DELETE_EVENT',
                'BROADCAST_MESSAGE',
                'SEND_SMS',
                'VIEW_ANALYTICS',
                'EXPORT_DATA',
                'LOGIN',
                'LOGOUT',
                'CREATE_STAFF_DRAFT',
                'SUBMIT_ROLE_ASSIGNMENT',
                'APPROVE_ROLE_ASSIGNMENT',
                'REJECT_ROLE_ASSIGNMENT',
                'ACTIVATE_ROLE',
                'ACCOUNT_LOCKED',
                'ACCOUNT_UNLOCKED',
                'IP_LOCKED',
                'FAILED_LOGIN',
                'CREATE_STUDENT_ACCOUNT',
                'CREATE_HR_ACCOUNT',
                'EMERGENCY_OVERRIDE',
                'CREATE_ROLE',
                'UPDATE_ROLE',
                'DELETE_ROLE'
            ],
            required: true
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        targetType: {
            type: String,
            enum: ['USER', 'EVENT', 'BROADCAST', 'SYSTEM', 'ROLE_ASSIGNMENT', 'STAFF_DRAFT', 'ROLE'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        changes: {
            before: mongoose.Schema.Types.Mixed,
            after: mongoose.Schema.Types.Mixed
        },
        ipAddress: String,
        userAgent: String,
        status: {
            type: String,
            enum: ['SUCCESS', 'FAILED'],
            default: 'SUCCESS'
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    }
);

// Index for efficient queries
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1, createdAt: -1 });

// Dashboard security analytics: failed logins count
auditLogSchema.index({ action: 1, status: 1, createdAt: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
