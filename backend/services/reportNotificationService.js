import Report from '../modules/governance/model/Report.js';
import User from '../modules/user/model/User.js';
import School from '../modules/school/model/School.js';
import { getReceiverSocketId, io } from '../utils/socketServer.js';

const PRIORITY_DEADLINE_DAYS = { low: 15, medium: 10, high: 5, critical: 2 };

const OVERDUE_WARNING_DAYS = {
  low: 12, medium: 7, high: 3, critical: 1,
};

const AUTO_ESCALATE_DAYS = {
  low: 15, medium: 10, high: 5, critical: 2,
};

async function findDeanForReport(report) {
  if (!report.schoolId) return null;
  try {
    const school = await School.findById(report.schoolId).select('dean').lean();
    if (!school || !school.dean) return null;
    return await User.findById(school.dean).lean();
  } catch {
    return null;
  }
}

async function sendNotification(payload) {
  try {
    const Notification = (await import('../modules/notification/models/Notification.js')).default;
    const notif = await Notification.create({
      targetUser: payload.recipientId,
      type: 'action',
      title: payload.title,
      message: payload.message,
      link: payload.reportId ? `/dean/governance/reports/${payload.reportId}` : undefined,
      isRead: false,
    });
    const socketId = getReceiverSocketId(payload.recipientId);
    if (socketId && io) {
      io.to(socketId).emit('notification:new', {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        type: 'action',
        timestamp: notif.createdAt,
      });
    }
  } catch (err) {
    console.error('[ReportNotification] Send error:', err);
  }
}

export async function checkNewSubmission(report) {
  try {
    let deanId = null;
    if (report.schoolId) {
      const school = await School.findById(report.schoolId).select('dean').lean();
      if (school && school.dean) deanId = school.dean;
    }

    if (!deanId) return;

    const dean = await User.findById(deanId).lean();
    if (!dean) return;

    const deanPayload = {
      type: report.priority === 'critical' ? 'CRITICAL_REPORT' : 'NEW_REPORT',
      title: report.priority === 'critical'
        ? `[CRITICAL] New Report: ${report.title}`
        : `New Report: ${report.title}`,
      message: `${report.authorName} (${report.departmentName}) submitted "${report.title}" for review.`,
      recipientId: dean._id,
      reportId: report._id,
    };

    await sendNotification(deanPayload);

    if (report.priority === 'critical') {
      const principal = await User.findOne({ role: 'principal' }).lean();
      if (principal) {
        await sendNotification({
          ...deanPayload,
          recipientId: principal._id,
          title: `[CRITICAL] Report Escalated: ${report.title}`,
          message: `A critical-priority report "${report.title}" from ${report.departmentName} requires immediate attention.`,
        });
      }
    }
  } catch (err) {
    console.error('[ReportNotification] New submission error:', err);
  }
}

export async function checkOverdueReports() {
  try {
    const now = new Date();
    const overdue = await Report.find({
      status: { $in: ['submitted', 'approved'] },
      acknowledgementDeadline: { $lt: now },
    }).lean();

    for (const report of overdue) {
      const dean = await findDeanForReport(report);
      if (!dean) continue;

      await sendNotification({
        type: 'OVERDUE_REPORT',
        title: 'Report Acknowledgement Overdue',
        message: `"${report.title}" (${report.departmentName}) is past its ${report.priority || 'medium'}-priority deadline and requires immediate attention.`,
        recipientId: dean._id,
        reportId: report._id,
      });
    }

    return { processed: overdue.length };
  } catch (err) {
    console.error('[ReportNotification] Overdue check error:', err);
    return { processed: 0, error: err.message };
  }
}

export async function checkWarningReports() {
  try {
    const now = new Date();
    const warnings = [];

    for (const [priority, days] of Object.entries(OVERDUE_WARNING_DAYS)) {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + days);

      const reports = await Report.find({
        priority,
        status: { $in: ['submitted', 'approved'] },
        acknowledgementDeadline: { $lte: threshold, $gt: new Date() },
      }).lean();

      warnings.push(...reports);
    }

    for (const report of warnings) {
      const dean = await findDeanForReport(report);
      if (!dean) continue;

      await sendNotification({
        type: 'REPORT_WARNING',
        title: 'Report Deadline Approaching',
        message: `"${report.title}" deadline is approaching. Please review and acknowledge.`,
        recipientId: dean._id,
        reportId: report._id,
      });
    }

    return { warned: warnings.length };
  } catch (err) {
    console.error('[ReportNotification] Warning check error:', err);
    return { warned: 0, error: err.message };
  }
}

export async function runOverdueCheck() {
  const overdueResult = await checkOverdueReports();
  const warningResult = await checkWarningReports();
  return { overdue: overdueResult, warnings: warningResult };
}
