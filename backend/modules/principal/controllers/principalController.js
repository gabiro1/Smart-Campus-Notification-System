import User from "../../user/model/User.js";
import Event from "../../event/model/Event.js";
import NotificationLog from "../../notification/models/NotificationLog.js";
import Announcement from "../../announcement/model/Announcement.js";
import AuditLog from "../../audit/models/AuditLog.js";
import GovernanceAnnouncement from "../../governance/model/GovernanceAnnouncement.js";
import Department from "../../department/model/Department.js";
import { cacheWrap } from "../../../services/cacheService.js";
import { evaluateWorkflows, getActionableAlerts } from "../../../services/workflowEngine.js";

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
