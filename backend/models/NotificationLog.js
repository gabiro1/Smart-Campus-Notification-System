import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    receivedAt: Date
});

export default mongoose.model('NotificationLog', NotificationLogSchema);