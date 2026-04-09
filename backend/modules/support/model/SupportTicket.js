import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ticketNumber: {
    type: Number,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['bug', 'feature_request', 'login_issue', 'notification_problem', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  screenshot: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in_review', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  adminReply: {
    type: String,
    default: null,
    maxLength: 1000
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
SupportTicketSchema.index({ status: 1, category: 1 });
SupportTicketSchema.index({ userId: 1, createdAt: -1 });

// Static method to get next ticket number
SupportTicketSchema.statics.getNextTicketNumber = async function() {
  const lastTicket = await this.findOne().sort({ ticketNumber: -1 });
  return lastTicket ? lastTicket.ticketNumber + 1 : 1;
};

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);
export default SupportTicket;
