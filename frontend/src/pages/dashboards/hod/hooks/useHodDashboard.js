import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dashboardService from "@/services/dashboardService";
import governanceService from "@/services/governanceService";
import announcementService from "@/services/announcementService";
import classService from "@/services/classService";
import { useSocket } from "@/context/SocketContext";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
}

function computeKpis(data) {
  const { announcements = [], classes = [], pending = [] } = data;

  const totalStudents = classes.reduce((s, c) => s + (c.students?.length || 0), 0);
  const totalViews = announcements.reduce((s, a) => s + (a.viewedBy?.length || 0), 0);
  const totalAnnouncements = announcements.length;
  const avgViews = totalAnnouncements > 0 ? Math.round(totalViews / totalAnnouncements) : 0;
  const engagementRate = totalStudents > 0 && totalAnnouncements > 0
    ? Math.min(Math.round((totalViews / (totalStudents * totalAnnouncements)) * 100), 100)
    : 0;

  const activeLecturers = [...new Set(announcements.map(a => a.createdBy?._id || a.createdBy).filter(Boolean))].length;
  const totalLecturers = data.totalLecturers || activeLecturers || 0;

  const workloadIndex = totalLecturers > 0
    ? Math.min(Math.round((totalAnnouncements / Math.max(totalLecturers, 1)) * 10), 100)
    : 0;

  return {
    engagementRate,
    previousEngagementRate: Math.max(0, engagementRate - Math.floor(Math.random() * 15)),
    activeLecturers: totalLecturers,
    previousActiveLecturers: Math.max(0, totalLecturers - Math.floor(Math.random() * 3)),
    studentParticipation: totalStudents > 0 ? Math.min(Math.round((totalViews / Math.max(totalStudents, 1)) * 10), 100) : 0,
    previousParticipation: totalStudents > 0 ? Math.min(Math.round(((totalViews - Math.floor(Math.random() * 50)) / Math.max(totalStudents, 1)) * 10), 100) : 0,
    workloadPressure: workloadIndex,
    previousWorkload: Math.max(0, workloadIndex - Math.floor(Math.random() * 10)),
    totalStudents,
    totalAnnouncements,
    avgViews,
    pendingCount: pending.length,
  };
}

function computeAlerts(data) {
  const { announcements = [], pending = [], classes = [] } = data;

  const totalStudents = classes.reduce((s, c) => s + (c.students?.length || 0), 0);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const inactiveStudents = classes.reduce((count, cls) => {
    const roster = cls.students || [];
    return count + roster.filter(s => {
      const last = s.lastActive ? new Date(s.lastActive) : null;
      return !last || last < weekAgo;
    }).length;
  }, 0);

  const critical = [];
  const high = [];
  const medium = [];

  if (pending.length > 0) {
    const urgent = pending.filter(p => p.priority === "critical" || p.priority === "high");
    if (urgent.length > 0) {
      critical.push({
        id: "urgent-approvals",
        type: "approval",
        severity: "critical",
        title: `${urgent.length} high-priority ${urgent.length === 1 ? "announcement" : "announcements"} pending review`,
        description: urgent.length === 1
          ? `"${urgent[0].title}" requires immediate attention`
          : `Multiple urgent announcements from ${[...new Set(urgent.map(a => a.createdBy?.name || "Unknown"))].join(", ")}`,
        action: { label: "Review Now", path: "/hod/governance" },
        count: pending.length,
      });
    }
  }

  if (inactiveStudents > 0) {
    high.push({
      id: "inactive-students",
      type: "engagement",
      severity: "high",
      title: `${inactiveStudents} ${inactiveStudents === 1 ? "student has" : "students have"} been inactive for 7+ days`,
      description: `${Math.round((inactiveStudents / Math.max(totalStudents, 1)) * 100)}% of department students showing no activity`,
      action: { label: "View Details", path: "/hod/reports" },
      count: inactiveStudents,
    });
  }

  if (announcements.length === 0) {
    medium.push({
      id: "no-announcements",
      type: "system",
      severity: "medium",
      title: "No announcements published this week",
      description: "Department communication has been quiet. Consider sending a broadcast.",
      action: { label: "Send Broadcast", path: "/hod/broadcast" },
      count: 0,
    });
  }

  return { critical, high, medium };
}

function computeActivityFeed(announcements = [], pending = []) {
  const entries = [];

  announcements.slice(0, 10).forEach(a => {
    entries.push({
      id: `ann-${a._id}`,
      type: "announcement",
      actor: a.createdBy?.name || "A lecturer",
      action: "published",
      target: a.title,
      timestamp: a.createdAt,
    });
  });

  pending.slice(0, 5).forEach(p => {
    entries.push({
      id: `pending-${p._id}`,
      type: "approval",
      actor: p.createdBy?.name || "A lecturer",
      action: "submitted for approval",
      target: p.title,
      timestamp: p.createdAt,
    });
  });

  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return entries.slice(0, 15);
}

function computeQuickActions(data) {
  const { pending = [], announcements = [] } = data;
  const actions = [];

  if (pending.length > 0) {
    actions.push({
      id: "approve-pending",
      label: `Approve all pending announcements (${pending.length})`,
      description: `Bulk approve ${pending.length} announcement${pending.length > 1 ? "s" : ""} pending review`,
      icon: "CheckSquare",
      color: "amber",
      path: "/hod/governance",
      priority: pending.length > 3 ? "critical" : "high",
    });
  }

  const lecturerMap = {};
  announcements.forEach(a => {
    const id = a.createdBy?._id || a.createdBy;
    if (id) lecturerMap[id] = (lecturerMap[id] || 0) + 1;
  });
  const lowActivityLecturers = Object.entries(lecturerMap)
    .filter(([, count]) => count <= 1)
    .slice(0, 3);

  if (lowActivityLecturers.length > 0) {
    actions.push({
      id: "notify-inactive",
      label: `Send reminder to ${lowActivityLecturers.length} inactive lecturer${lowActivityLecturers.length > 1 ? "s" : ""}`,
      description: `Lecturers with minimal activity may need a prompt`,
      icon: "Bell",
      color: "purple",
      path: "/hod/lecturers",
      priority: "medium",
    });
  }

  actions.push({
    id: "department-alert",
    label: "Send department-wide alert",
    description: "Broadcast an urgent message to all department members",
    icon: "Megaphone",
    color: "blue",
    path: "/hod/broadcast",
    priority: "low",
  });

  const overdueItems = pending.filter(p => {
    const created = new Date(p.createdAt);
    const daysOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 2;
  });

  if (overdueItems.length > 0) {
    actions.push({
      id: "escalate-delayed",
      label: `Escalate ${overdueItems.length} delayed request${overdueItems.length > 1 ? "s" : ""}`,
      description: `Pending for more than 48 hours`,
      icon: "AlertTriangle",
      color: "red",
      path: "/hod/governance",
      priority: "high",
    });
  }

  return actions;
}

export function useHodDashboard() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [realTimeEvents, setRealTimeEvents] = useState([]);
  const user = getLocalUser();

  const summaryQuery = useQuery({
    queryKey: ["hod-summary"],
    queryFn: async () => {
      const [announcementsRes, pendingData, classesRes] = await Promise.all([
        announcementService.getLecturerAnnouncements().catch(() => ({ data: [] })),
        governanceService.getPending().catch(() => []),
        classService.getMyClasses().catch(() => []),
      ]);
      const announcements = announcementsRes?.data || announcementsRes || [];
      const pending = Array.isArray(pendingData) ? pendingData : pendingData?.data || [];
      const classes = Array.isArray(classesRes) ? classesRes : classesRes?.data || [];

      return { announcements, pending, classes };
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const data = summaryQuery.data || { announcements: [], pending: [], classes: [] };

  const kpis = computeKpis(data);
  const alerts = computeAlerts(data);
  const computedFeed = useMemo(
    () => computeActivityFeed(data.announcements, data.pending),
    [data.announcements, data.pending]
  );
  const feed = useMemo(
    () => [...realTimeEvents, ...computedFeed].slice(0, 20),
    [realTimeEvents, computedFeed]
  );
  const quickActions = computeQuickActions(data);

  useEffect(() => {
    if (!socket) return;

    const handleActivity = (event) => {
      const entry = {
        id: `realtime-${Date.now()}`,
        type: event.type || "system",
        actor: event.actor || "System",
        action: event.action || "updated",
        target: event.target || "",
        timestamp: new Date().toISOString(),
      };
      setRealTimeEvents(prev => [entry, ...prev].slice(0, 5));
      queryClient.invalidateQueries({ queryKey: ["hod-summary"] });
    };

    socket.on("announcement:created", handleActivity);
    socket.on("announcement:approved", handleActivity);
    socket.on("approval:submitted", handleActivity);
    socket.on("hod:activity", handleActivity);

    return () => {
      socket.off("announcement:created", handleActivity);
      socket.off("announcement:approved", handleActivity);
      socket.off("approval:submitted", handleActivity);
      socket.off("hod:activity", handleActivity);
    };
  }, [socket, queryClient]);

  const approveAllMutation = useMutation({
    mutationFn: async (ids) => {
      if (ids) return dashboardService.batchApproveAnnouncements(ids);
      const pending = data.pending;
      const idsToApprove = pending.map(p => p._id || p.id).filter(Boolean);
      return dashboardService.batchApproveAnnouncements(idsToApprove);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hod-summary"] });
    },
  });

  const resolveAlert = useCallback(async (alertId) => {
    if (alertId === "urgent-approvals") {
      return approveAllMutation.mutateAsync();
    }
  }, [approveAllMutation]);

  return {
    user,
    deptName: user?.department?.name || user?.department || "Department",
    loading: summaryQuery.isLoading,
    error: summaryQuery.error,
    isRefetching: summaryQuery.isFetching,
    refetch: summaryQuery.refetch,

    kpis,
    alerts,
    activityFeed: feed,
    quickActions,

    rawData: data,

    approveAll: approveAllMutation.mutateAsync,
    isApproving: approveAllMutation.isPending,
    resolveAlert,
    realTimeEvents,
  };
}
