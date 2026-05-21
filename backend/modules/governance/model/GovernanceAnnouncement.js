/**
 * GovernanceAnnouncement.js
 * --------------------------
 * Mongoose model for the Announcement Governance Engine.
 * This is separate from the existing class-level Announcement model.
 */

import mongoose from 'mongoose';

const governanceAnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },

    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },

    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },

    targetScope: {
      type: String,
      enum: ['module', 'department', 'school', 'college'],
      required: [true, 'Target scope is required'],
    },

    // -----> GOVERNANCE LIFECYCLE <-----
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },

    // The role that must approve this announcement before it can be published
    pendingApprovalFromRole: {
      type: String,
      enum: ['hod', 'dean', 'principal', null],
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    // -----> AUTHOR CONTEXT <-----
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    authorRole: {
      type: String,
      required: true,
    },

    authorName: {
      type: String,
    },

    // -----> SCOPING CONTEXT (for jurisdiction checks) <-----
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
    },

    // -----> READ RECEIPTS <-----
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],

    // -----> REVIEW AUDIT <-----
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

governanceAnnouncementSchema.index({ status: 1, createdAt: -1 });
governanceAnnouncementSchema.index({ status: 1, priority: 1, createdAt: -1 });

const GovernanceAnnouncement = mongoose.model(
  'GovernanceAnnouncement',
  governanceAnnouncementSchema
);

export default GovernanceAnnouncement;
