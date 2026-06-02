import StaffDraft from '../models/StaffDraft.js';
import RoleAssignment from '../models/RoleAssignment.js';
import User from '../../user/model/User.js';
import AuditLog from '../../audit/models/AuditLog.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import { emitToRole } from '../../../utils/socketServer.js';
import bcrypt from 'bcryptjs';

const logAudit = async (adminId, action, targetId, targetType, description) => {
  try {
    await AuditLog.create({ adminId, action, targetId, targetType, description, status: 'SUCCESS' });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
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

    const draft = await StaffDraft.create({
      fullName, email, phoneNumber, targetRole,
      department: department || null,
      school: school || null,
      college: college || null,
      status: 'DRAFT',
      createdBy: req.user._id
    });

    await logAudit(req.user._id, 'CREATE_STAFF_DRAFT', draft._id, 'STAFF_DRAFT', `Created ${targetRole} draft for ${fullName}`);

    return res.status(201).json({ success: true, message: 'Staff draft created', data: draft });
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

    draft.status = 'PENDING';
    await draft.save();

    const assignment = await RoleAssignment.create({
      staffDraft: draft._id,
      fullName: draft.fullName,
      email: draft.email,
      targetRole: draft.targetRole,
      department: draft.department,
      school: draft.school,
      college: draft.college,
      status: 'PENDING',
      requester: req.user._id,
      requesterRole: req.user.role,
      approvalChain: [{ role: req.user.role, action: 'SUBMITTED', by: req.user._id, at: new Date() }]
    });

    draft.assignmentRequest = assignment._id;
    await draft.save();

    await logAudit(req.user._id, 'SUBMIT_ROLE_ASSIGNMENT', assignment._id, 'ROLE_ASSIGNMENT',
      `Submitted role assignment request for ${draft.fullName} as ${draft.targetRole}`);

    // Notify admin and principal roles in real-time
    const notificationBody = {
      referenceId: assignment._id,
      title: 'New Role Assignment',
      message: `${draft.fullName} submitted for ${draft.targetRole.replace(/_/g, ' ')} role`,
      type: 'action',
      priority: 'medium',
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

    emitToRole('admin', 'role-assignment:new', { assignmentId: assignment._id });
    emitToRole('principal', 'role-assignment:new', { assignmentId: assignment._id });

    return res.status(201).json({ success: true, message: 'Role assignment submitted for approval', data: assignment });
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
