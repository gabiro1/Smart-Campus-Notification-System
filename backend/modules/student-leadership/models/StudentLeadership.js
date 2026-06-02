import mongoose from 'mongoose';

const guildPresidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  electionId: { type: String, required: true, unique: true },
  voteCount: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  academicYear: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
    default: 'PENDING_APPROVAL'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const classRepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING'
  },
  academicYear: { type: String, required: true },
}, { timestamps: true });

const guildCouncilSchema = new mongoose.Schema({
  electionId: { type: String, required: true, unique: true },
  academicYear: { type: String, required: true },
  positions: [{
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    voteCount: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    runnerUp: { type: String, default: '' },
  }],
  voterTurnout: { type: Number, default: 0 },
  eligibleVoters: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
    default: 'PENDING_APPROVAL'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

guildPresidentSchema.index({ status: 1, createdAt: -1 });
guildPresidentSchema.index({ electionId: 1 });
guildCouncilSchema.index({ status: 1, createdAt: -1 });
guildCouncilSchema.index({ electionId: 1 });
classRepSchema.index({ status: 1, proposedBy: 1 });
classRepSchema.index({ classId: 1, academicYear: 1 });

export const GuildPresident = mongoose.model('GuildPresident', guildPresidentSchema);
export const GuildCouncil = mongoose.model('GuildCouncil', guildCouncilSchema);
export const ClassRepresentative = mongoose.model('ClassRepresentative', classRepSchema);
