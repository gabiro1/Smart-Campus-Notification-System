import StaffDraft from '../models/StaffDraft.js';
import RoleAssignment from '../models/RoleAssignment.js';
import User from '../../user/model/User.js';
import AuditLog from '../../audit/models/AuditLog.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import { emitToRole } from '../../../utils/socketServer.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const logAudit = async (adminId, action, targetId, targetType, description) => {
  try {
    await AuditLog.create({ adminId, action, targetId, targetType, description, status: 'SUCCESS' });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const sendAccountSetupEmail = async (email, name, token) => {
  const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${token}`;
  const transporter = getEmailTransporter();
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: `Your ${name} Account Has Been Created — Set Your Password`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniNotify AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">A staff account has been created for you. Click the button below to set your password and get started:</p>
            <div style="text-align: center;">
              <a href="${setupUrl}" class="button">Set Your Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link expires in <strong>24 hours</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't expect this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>UniNotify AI - Smart Campus Notification System</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Creates the user account, activates the role, and notifies admin/principal — no approval step
const activateStaffDraft = async (draft, hrUser) => {
  const now = new Date();

  const assignment = await RoleAssignment.create({
    staffDraft: draft._id,
    fullName: draft.fullName,
    email: draft.email,
    targetRole: draft.targetRole,
    department: draft.department,
    school: draft.school,
    college: draft.college,
    status: 'ACTIVATED',
    requester: hrUser._id,
    requesterRole: hrUser.role,
    approvedBy: hrUser._id,
    approvedAt: now,
    activatedBy: hrUser._id,
    activatedAt: now,
    approvalChain: [
      { role: hrUser.role, action: 'SUBMITTED', by: hrUser._id, at: now },
      { role: hrUser.role, action: 'ACTIVATED', by: hrUser._id, at: now },
    ]
  });

  const tempPassword = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  const token = crypto.randomBytes(32).toString('hex');

  const newUser = await User.create({
    name: draft.fullName,
    email: draft.email,
    password: hashedPassword,
    role: draft.targetRole,
    status: 'ACTIVE',
    createdBy: hrUser._id,
    approvedBy: hrUser._id,
    department: draft.department || undefined,
    school: draft.school || undefined,
    college: draft.college || undefined,
    mustChangePassword: true,
    passwordResetToken: token,
    passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  assignment.targetUser = newUser._id;
  await assignment.save();

  draft.status = 'ACTIVATED';
  draft.assignmentRequest = assignment._id;
  draft.reviewedBy = hrUser._id;
  draft.reviewedAt = now;
  draft.activatedAt = now;
  await draft.save();

  try {
    await sendAccountSetupEmail(draft.email, draft.fullName, token);
  } catch (emailErr) {
    console.error('Failed to send account setup email:', emailErr);
  }

  await logAudit(hrUser._id, 'SUBMIT_ROLE_ASSIGNMENT', assignment._id, 'ROLE_ASSIGNMENT',
    `Created account and activated ${draft.targetRole} role for ${draft.fullName} (no approval required)`);

  const notificationBody = {
    referenceId: assignment._id,
    title: 'New Staff Account Activated',
    message: `${draft.fullName} was added and activated as ${draft.targetRole.replace(/_/g, ' ')}`,
    type: 'info',
    priority: 'low',
    status: 'unread',
  };

  const adminUsers = await User.find({ role: { $in: ['admin', 'principal'] } }).select('_id');
  const notificationLogs = adminUsers.map(u => ({
    ...notificationBody,
    studentId: u._id,
    recipientId: u._id,
  }));
  if (notificationLogs.length > 0) {
    await NotificationLog.insertMany(notificationLogs);
  }

  emitToRole('admin', 'role-assignment:activated', { assignmentId: assignment._id });
  emitToRole('principal', 'role-assignment:activated', { assignmentId: assignment._id });

  return { assignment, newUser };
};

export const getHrOverview = async (req, res) => {
  try {
    const [totalStaff, draftsByStatus, assignmentsByStatus, recentDrafts, recentAssignments] = await Promise.all([
      User.countDocuments({ role: { $in: ['lecturer', 'hod', 'dean', 'principal', 'registrar'] } }),
      StaffDraft.aggregate([
        { $match: { createdBy: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      RoleAssignment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      StaffDraft.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 }).limit(5).lean(),
      RoleAssignment.find({ requester: req.user._id })
        .sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const statusMap = (arr, defaultKey = 'DRAFT') => {
      const m = { DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, ACTIVATED: 0 };
      arr.forEach(({ _id, count }) => { if (m[_id] !== undefined) m[_id] = count; });
      return m;
    };

    const draftCounts = statusMap(draftsByStatus);
    const assignmentCounts = statusMap(assignmentsByStatus);

    const recentActivity = [
      ...recentDrafts.map(d => ({
        _id: d._id,
        type: 'draft',
        action: `Created ${d.targetRole} draft for ${d.fullName}`,
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...recentAssignments.map(a => ({
        _id: a._id,
        type: 'assignment',
        action: `Assignment for ${a.fullName} as ${a.targetRole} ${a.status.toLowerCase()}`,
        status: a.status,
        createdAt: a.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        totalStaff,
        drafts: draftCounts,
        assignments: assignmentCounts,
        totalDrafts: Object.values(draftCounts).reduce((a, b) => a + b, 0),
        totalAssignments: Object.values(assignmentCounts).reduce((a, b) => a + b, 0),
        recentActivity,
      }
    });
  } catch (error) {
    console.error('getHrOverview Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaffDraft = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, targetRole, department, school, college } = req.body;

    if (!fullName || !email || !targetRole) {
      return res.status(400).json({ success: false, message: 'fullName, email, and targetRole are required' });
    }

    const allowedRoles = ['lecturer', 'hod', 'dean', 'principal', 'registrar'];
    if (!allowedRoles.includes(targetRole)) {
      return res.status(400).json({ success: false, message: `Invalid target role. Allowed: ${allowedRoles.join(', ')}` });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const draft = await StaffDraft.create({
      fullName, email, phoneNumber, targetRole,
      department: department || null,
      school: school || null,
      college: college || null,
      status: 'DRAFT',
      createdBy: req.user._id
    });

    await logAudit(req.user._id, 'CREATE_STAFF_DRAFT', draft._id, 'STAFF_DRAFT', `Created ${targetRole} draft for ${fullName}`);

    // No approval step required: activate the account immediately
    const { assignment, newUser } = await activateStaffDraft(draft, req.user);

    return res.status(201).json({
      success: true,
      message: `Staff account created and ${targetRole} role activated immediately. A setup email has been sent.`,
      data: { draft, assignment, user: newUser }
    });
  } catch (error) {
    console.error('createStaffDraft Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffDrafts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { createdBy: req.user._id };
    if (status) query.status = status;

    const drafts = await StaffDraft.find(query)
      .populate('department', 'name code')
      .populate('school', 'name code')
      .populate('college', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: drafts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaffDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await StaffDraft.findById(id);

    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (draft.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this draft' });
    }
    if (!['DRAFT', 'PENDING', 'REJECTED'].includes(draft.status)) {
      return res.status(400).json({ success: false, message: 'Draft cannot be edited in its current state' });
    }

    // Withdraw existing submission when editing a PENDING or REJECTED draft
    if (draft.status === 'PENDING' || draft.status === 'REJECTED') {
      if (draft.assignmentRequest) {
        await RoleAssignment.findByIdAndDelete(draft.assignmentRequest);
        draft.assignmentRequest = undefined;
      }
      draft.status = 'DRAFT';
    }

    const allowedFields = ['fullName', 'email', 'phoneNumber', 'targetRole', 'department', 'school', 'college'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) draft[field] = req.body[field];
    });

    await draft.save();
    return res.status(200).json({ success: true, message: 'Draft updated', data: draft });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStaffDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const draft = await StaffDraft.findById(id);

    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (draft.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (draft.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Can only delete DRAFT drafts' });
    }

    await StaffDraft.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Draft deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitRoleAssignment = async (req, res) => {
  try {
    const { draftId } = req.body;
    if (!draftId) return res.status(400).json({ success: false, message: 'draftId is required' });

    const draft = await StaffDraft.findById(draftId);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (draft.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (draft.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Draft already submitted or processed' });
    }

    const existingUser = await User.findOne({ email: draft.email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    // No approval step required: create the user account and apply the role immediately
    const { assignment, newUser } = await activateStaffDraft(draft, req.user);

    return res.status(201).json({
      success: true,
      message: `User account created and ${draft.targetRole} role activated immediately. A setup email has been sent.`,
      data: { user: newUser, assignment }
    });
  } catch (error) {
    console.error('submitRoleAssignment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRoleAssignments = async (req, res) => {
  try {
    const assignments = await RoleAssignment.find({ requester: req.user._id })
      .populate('staffDraft')
      .populate('approvedBy', 'name email')
      .populate('activatedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRoleAssignments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const assignments = await RoleAssignment.find(query)
      .populate('staffDraft')
      .populate('requester', 'name email')
      .populate('approvedBy', 'name email')
      .populate('activatedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
