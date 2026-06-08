import User from "../../user/model/User.js";
import Event from "../../event/model/Event.js";
import NotificationLog from "../../notification/models/NotificationLog.js";
import Announcement from "../../announcement/model/Announcement.js";
import AuditLog from "../../audit/models/AuditLog.js";
import GovernanceAnnouncement from "../../governance/model/GovernanceAnnouncement.js";
import Department from "../../department/model/Department.js";
import { cacheWrap } from "../../../services/cacheService.js";
import { evaluateWorkflows, getActionableAlerts } from "../../../services/workflowEngine.js";
import { emitToRole } from "../../../utils/socketServer.js";
import RoleAssignment from '../../hr/models/RoleAssignment.js';
import StaffDraft from '../../hr/models/StaffDraft.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const startOfToday = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const startOfYesterday = () => new Date(startOfToday().getTime() - 86400000);
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const calcTrend = (t, y) => (y > 0 ? Math.round(((t - y) / y) * 100) : t > 0 ? 100 : 0);

async function computeOverview() {
  const today = startOfToday();
  const yesterday = startOfYesterday();
  const sevenDaysAgo = daysAgo(7);

  const [
    totalUsers,
    totalNotifications,
    todayNotifications,
    yesterdayNotifications,
    todayNewUsers,
    yesterdayNewUsers,
    totalEvents,
    todayEvents,
    yesterdayEvents,
    readStatsArr,
    pendingEvents,
    pendingAnnouncements,
    governancePending,
    failedLogins,
    hourlyVolume,
    activeEmergencies,
    usersByRole,
    usersBySchool,
    recentEvents,
  ] = await Promise.all([
    User.countDocuments(),
    NotificationLog.countDocuments(),
    NotificationLog.countDocuments({ createdAt: { $gte: today } }),
    NotificationLog.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    Event.countDocuments(),
    Event.countDocuments({ createdAt: { $gte: today } }),
    Event.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    NotificationLog.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } } } },
    ]),
    Event.countDocuments({ status: "pending" }),
    GovernanceAnnouncement.countDocuments({ status: "pending" }),
    GovernanceAnnouncement.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.countDocuments({ action: "LOGIN", status: "FAILED", createdAt: { $gte: today } }),
    NotificationLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Announcement.countDocuments({ status: "Active", requiresAcknowledgment: true }),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.aggregate([
      { $lookup: { from: "schools", localField: "school", foreignField: "_id", as: "schoolData" } },
      { $unwind: { path: "$schoolData", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$schoolData.name", count: { $sum: 1 } } },
    ]),
    Event.find({ createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).limit(5).populate("createdBy", "name").lean(),
  ]);

  const readStats = readStatsArr[0] || { total: 0, read: 0 };
  const readRate = readStats.total > 0 ? Math.round((readStats.read / readStats.total) * 100) : 0;

  const hourlyMap = {};
  hourlyVolume.forEach((h) => (hourlyMap[h._id] = h.count));
  const volumeByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: String(i).padStart(2, "0") + ":00",
    count: hourlyMap[i] || 0,
  }));
  const peakHour = volumeByHour.reduce((max, h) => (h.count > max.count ? h : max), { count: 0 });

  const engagementTrend = calcTrend(todayNotifications, yesterdayNotifications);

  const deliveryRateAgg = await NotificationLog.aggregate([
    { $group: { _id: null, total: { $sum: 1 }, delivered: { $sum: { $cond: [{ $in: ["$status", ["delivered", "read"]] }, 1, 0] } } } },
  ]);
  const deliveryStats = deliveryRateAgg[0] || { total: 0, delivered: 0 };
  const deliveryRate = deliveryStats.total > 0 ? Math.round((deliveryStats.delivered / deliveryStats.total) * 100) : 0;

  const metrics = {
    totalUsers,
    totalNotifications,
    todayNotifications,
    yesterdayNotifications,
    todayNewUsers,
    yesterdayNewUsers,
    totalEvents,
    todayEvents,
    yesterdayEvents,
    readRate,
    deliveryRate,
    engagementTrend,
    totalPendingApprovals: pendingEvents + pendingAnnouncements,
    failedLogins,
  };

  const trends = {
    engagement: engagementTrend,
    events: calcTrend(todayEvents, yesterdayEvents),
    registrations: calcTrend(todayNewUsers, yesterdayNewUsers),
  };

  await evaluateWorkflows(metrics, trends);

  return {
    alerts: getActionableAlerts(),
    metrics,
    trends,
    hourlyVolume: volumeByHour,
    peakHour: peakHour.count > 0 ? peakHour.hour : null,
    pendingItems: {
      events: pendingEvents,
      announcements: pendingAnnouncements,
      items: governancePending.map((g) => ({
        _id: g._id,
        title: g.title,
        priority: g.priority,
        authorName: g.authorName,
        createdAt: g.createdAt,
        type: "announcement",
      })),
    },
    usersByRole,
    usersBySchool,
    recentEvents: recentEvents.map((e) => ({
      _id: e._id,
      title: e.title,
      author: e.createdBy?.name || "Unknown",
      createdAt: e.createdAt,
    })),
    system: {
      deliveryRate,
      readRate,
      activeEmergencies,
      totalEvents,
      database: "operational",
      api: "operational",
      notifications: deliveryRate >= 85 ? "operational" : "degraded",
    },
  };
}

export const getPrincipalOverview = async (req, res) => {
  try {
    const data = await cacheWrap("principal:overview", 120, computeOverview);
    res.json({ success: true, data });
  } catch (error) {
    console.error("getPrincipalOverview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentAnalytics = async (req, res) => {
  try {
    const data = await cacheWrap("principal:departments", 300, async () => {
      const result = await NotificationLog.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "recipientId",
            foreignField: "_id",
            pipeline: [
              {
                $lookup: {
                  from: "departments",
                  localField: "department",
                  foreignField: "_id",
                  as: "dept",
                },
              },
              { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
            ],
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $match: { "user.dept": { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$user.dept._id",
            name: { $first: "$user.dept.name" },
            code: { $first: "$user.dept.code" },
            school: { $first: "$user.dept.school" },
            notificationsSent: { $sum: 1 },
            notificationsRead: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } },
          },
        },
        {
          $addFields: {
            readRate: {
              $cond: [
                { $gt: ["$notificationsSent", 0] },
                { $round: [{ $multiply: [{ $divide: ["$notificationsRead", "$notificationsSent"] }, 100] }, 0] },
                0,
              ],
            },
          },
        },
        { $sort: { readRate: -1 } },
      ]);

      const departments = await Promise.all(
        result.map(async (d) => ({
          id: d._id,
          name: d.name,
          code: d.code,
          notificationsSent: d.notificationsSent,
          readRate: d.readRate,
        }))
      );

      const avgReadRate =
        departments.length > 0
          ? Math.round(departments.reduce((s, d) => s + d.readRate, 0) / departments.length)
          : 0;

      return { departments, avgReadRate, totalDepartments: departments.length };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("getDepartmentAnalytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCommunicationTrends = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const data = await cacheWrap("principal:trends:" + days, 3600, async () => {
      const since = daysAgo(days);

      const [dailyVolume, typeDistribution, hourlyDistribution, readTrend] = await Promise.all([
        NotificationLog.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        NotificationLog.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        NotificationLog.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        NotificationLog.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              sent: { $sum: 1 },
              read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      const totalInPeriod = dailyVolume.reduce((s, d) => s + d.count, 0);

      return {
        period: { days },
        summary: { totalNotifications: totalInPeriod, avgDaily: dailyVolume.length > 0 ? Math.round(totalInPeriod / dailyVolume.length) : 0 },
        dailyVolume: dailyVolume.map((d) => ({ date: d._id, count: d.count })),
        typeDistribution,
        hourlyDistribution: hourlyDistribution.map((h) => ({ hour: String(h._id).padStart(2, "0") + ":00", count: h.count })),
        peakHours: [...hourlyDistribution].sort((a, b) => b.count - a.count).slice(0, 3),
        readTrend: readTrend.map((d) => ({ date: d._id, rate: d.sent > 0 ? Math.round((d.read / d.sent) * 100) : 0 })),
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("getCommunicationTrends Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApprovalAnalytics = async (req, res) => {
  try {
    const data = await cacheWrap("principal:approvals:30d", 3600, async () => {
      const thirtyDaysAgo = daysAgo(30);

      const [eventApprovals, announcementApprovals, pendingByPriority, approvalTimeline] =
        await Promise.all([
          Event.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          GovernanceAnnouncement.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          GovernanceAnnouncement.aggregate([
            { $match: { status: "pending" } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
          ]),
          Event.aggregate([
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo },
                status: { $in: ["approved", "rejected"] },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
              },
            },
            { $sort: { _id: 1 } },
          ]),
        ]);

      return {
        events: {
          approved: eventApprovals.find((e) => e._id === "approved")?.count || 0,
          rejected: eventApprovals.find((e) => e._id === "rejected")?.count || 0,
          pending: eventApprovals.find((e) => e._id === "pending")?.count || 0,
        },
        announcements: {
          approved: announcementApprovals.find((a) => a._id === "published")?.count || 0,
          rejected: announcementApprovals.find((a) => a._id === "rejected")?.count || 0,
          pending: announcementApprovals.find((a) => a._id === "pending")?.count || 0,
        },
        pendingByPriority,
        approvalTimeline,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("getApprovalAnalytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// ROLE ASSIGNMENT APPROVAL (Principal & Admin)
// ============================================================

export const getPendingRoleAssignments = async (req, res) => {
  try {
    const assignments = await RoleAssignment.find({ status: { $in: ['PENDING', 'APPROVED'] } })
      .populate('staffDraft')
      .populate('requester', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    console.error('getPendingRoleAssignments Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveRoleAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await RoleAssignment.findById(id).populate('staffDraft');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (assignment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Assignment already ${assignment.status}` });
    }

    assignment.status = 'APPROVED';
    assignment.approvedBy = req.user._id;
    assignment.approvedAt = new Date();
    assignment.approvalChain.push({ role: req.user.role, action: 'APPROVED', by: req.user._id, at: new Date() });
    await assignment.save();

    if (assignment.staffDraft) {
      assignment.staffDraft.status = 'APPROVED';
      assignment.staffDraft.reviewedBy = req.user._id;
      assignment.staffDraft.reviewedAt = new Date();
      await assignment.staffDraft.save();
    }

    await AuditLog.create({ adminId: req.user._id, action: 'APPROVE_ROLE_ASSIGNMENT', targetId: assignment._id, targetType: 'ROLE_ASSIGNMENT', description: `Approved role assignment for ${assignment.fullName} as ${assignment.targetRole}`, status: 'SUCCESS' }).catch(() => {});

    emitToRole('hr', 'role-assignment:updated', { assignmentId: assignment._id, status: 'APPROVED' });

    return res.status(200).json({ success: true, message: 'Role assignment approved', data: assignment });
  } catch (error) {
    console.error('approveRoleAssignment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectRoleAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const assignment = await RoleAssignment.findById(id).populate('staffDraft');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (assignment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Assignment already ${assignment.status}` });
    }

    assignment.status = 'REJECTED';
    assignment.rejectionReason = reason.trim();
    assignment.approvedBy = req.user._id;
    assignment.approvedAt = new Date();
    assignment.approvalChain.push({ role: req.user.role, action: 'REJECTED', by: req.user._id, at: new Date() });
    await assignment.save();

    if (assignment.staffDraft) {
      assignment.staffDraft.status = 'REJECTED';
      assignment.staffDraft.reviewedBy = req.user._id;
      assignment.staffDraft.reviewedAt = new Date();
      assignment.staffDraft.rejectionReason = reason.trim();
      await assignment.staffDraft.save();
    }

    await AuditLog.create({ adminId: req.user._id, action: 'REJECT_ROLE_ASSIGNMENT', targetId: assignment._id, targetType: 'ROLE_ASSIGNMENT', description: `Rejected role assignment for ${assignment.fullName} as ${assignment.targetRole}: ${reason}`, status: 'SUCCESS' }).catch(() => {});

    emitToRole('hr', 'role-assignment:updated', { assignmentId: assignment._id, status: 'REJECTED' });

    return res.status(200).json({ success: true, message: 'Role assignment rejected', data: assignment });
  } catch (error) {
    console.error('rejectRoleAssignment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
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

export const activateRoleAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await RoleAssignment.findById(id);

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (assignment.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Assignment must be approved before activation' });
    }

    const existingUser = await User.findOne({ email: assignment.email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const token = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      name: assignment.fullName,
      email: assignment.email,
      password: hashedPassword,
      role: assignment.targetRole,
      status: 'ACTIVE',
      createdBy: assignment.requester,
      approvedBy: assignment.approvedBy,
      department: assignment.department || undefined,
      school: assignment.school || undefined,
      college: assignment.college || undefined,
      mustChangePassword: true,
      passwordResetToken: token,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    try {
      await sendAccountSetupEmail(assignment.email, assignment.fullName, token);
    } catch (emailErr) {
      console.error('Failed to send account setup email:', emailErr);
    }

    assignment.status = 'ACTIVATED';
    assignment.targetUser = newUser._id;
    assignment.activatedBy = req.user._id;
    assignment.activatedAt = new Date();
    assignment.approvalChain.push({ role: req.user.role, action: 'ACTIVATED', by: req.user._id, at: new Date() });
    await assignment.save();

    const staffDraft = await StaffDraft.findById(assignment.staffDraft);
    if (staffDraft) {
      staffDraft.status = 'ACTIVATED';
      staffDraft.activatedAt = new Date();
      await staffDraft.save();
    }

    await AuditLog.create({ adminId: req.user._id, action: 'ACTIVATE_ROLE', targetId: newUser._id, targetType: 'USER', description: `Activated user account for ${assignment.fullName} as ${assignment.targetRole}`, status: 'SUCCESS' }).catch(() => {});

    emitToRole('hr', 'role-assignment:updated', { assignmentId: assignment._id, status: 'ACTIVATED' });

    return res.status(200).json({
      success: true,
      message: `User account created and ${assignment.targetRole} role activated. A setup email has been sent.`,
      data: { user: newUser, assignment }
    });
  } catch (error) {
    console.error('activateRoleAssignment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resendSetupEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await RoleAssignment.findById(id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (assignment.status !== 'ACTIVATED') {
      return res.status(400).json({ success: false, message: 'Assignment must be activated first' });
    }
    if (!assignment.targetUser) {
      return res.status(400).json({ success: false, message: 'No user associated with this assignment' });
    }

    const user = await User.findById(assignment.targetUser);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendAccountSetupEmail(user.email, user.name, token);

    return res.status(200).json({ success: true, message: 'Setup email resent successfully' });
  } catch (error) {
    console.error('resendSetupEmail Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
