import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  Scale,
  Plus,
  UserPlus,
  Bell,
  ChevronRight,
  RefreshCw,
  UserCheck,
  FileText,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import classService from "../../../../services/classService";
import leadershipService from "../../../../services/studentLeadershipService";
import adminService from "../../../../services/adminService";

export default function DepartmentOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    lecturers: 0,
    classes: 0,
    students: 0,
    pendingApprovals: 0,
    pendingCPs: 0,
  });
  const [pendingCPs, setPendingCPs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const departmentId = user.department;

      const [lecturers, classes, userData, pendingCPsData, leadershipStats] = await Promise.all([
        classService.getLecturers().catch(() => []),
        classService.getAllClasses().catch(() => []),
        adminService.getUsers(1, 1, { department: departmentId, role: "student" }, true).catch(() => ({ users: [], pagination: { total: 0 } })),
        leadershipService.getPendingClassReps().catch(() => ({ data: [] })),
        leadershipService.getStats().catch(() => ({ data: {} })),
      ]);

      const lecturersList = Array.isArray(lecturers) ? lecturers : [];
      const classesList = Array.isArray(classes) ? classes : [];
      const deptClasses = classesList.filter(
        (c) => String(c.department?._id || c.department) === String(departmentId)
      );
      const usersData = userData?.users || [];
      const totalStudents = userData?.pagination?.total || usersData.length || 0;

      const cpList = pendingCPsData?.data || (Array.isArray(pendingCPsData) ? pendingCPsData : []);
      const leadershipData = leadershipStats?.data || {};
      const pendingApprovals = (leadershipData.pendingCPs || 0) + (leadershipData.pendingElections || 0);

      setStats({
        lecturers: lecturersList.length,
        classes: deptClasses.length,
        students: totalStudents,
        pendingApprovals,
        pendingCPs: cpList.length || leadershipData.pendingCPs || 0,
      });
      setPendingCPs(cpList.slice(0, 5));
      setRecentActivity(
        cpList.slice(0, 3).map((cp) => ({
          id: cp._id,
          type: "class_rep",
          title: `New CP proposal: ${cp.userId?.name || "Unknown"}`,
          time: cp.createdAt,
          status: "pending",
        }))
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const quickActions = [
    {
      icon: Plus,
      label: "Create Class",
      description: "Add a new class to your department",
      path: "/hod/lecturers",
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: UserPlus,
      label: "Manage Lecturers",
      description: "View and assign lecturers to classes",
      path: "/hod/lecturers",
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
    },
    {
      icon: Scale,
      label: "Pending Approvals",
      description: `${stats.pendingApprovals} items awaiting your review`,
      path: "/hod/governance",
      color: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/20",
    },
    {
      icon: Bell,
      label: "Send Broadcast",
      description: "Send a notification to your department",
      path: "/hod/broadcast",
      color: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-accent rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-accent rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingCard className="h-64" />
          <LoadingCard className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
          <Activity size={48} className="text-red-400" />
          <p className="text-lg font-semibold text-foreground">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
          >
            Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Department Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user.name || "HoD"}. Here&apos;s what&apos;s happening in your department.
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Lecturers"
          value={stats.lecturers}
          icon={Users}
          iconBgClass="bg-blue-500/10"
          iconClass="text-blue-500"
        />
        <StatCard
          title="Classes"
          value={stats.classes}
          icon={BookOpen}
          iconBgClass="bg-emerald-500/10"
          iconClass="text-emerald-500"
        />
        <StatCard
          title="Students"
          value={stats.students}
          icon={GraduationCap}
          iconBgClass="bg-purple-500/10"
          iconClass="text-purple-500"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Scale}
          iconBgClass="bg-amber-500/10"
          iconClass="text-amber-500"
          trend={stats.pendingCPs > 0 ? `${stats.pendingCPs} CP proposals` : undefined}
          isPositive={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(action.path)}
                className="group relative p-4 rounded-xl border border-border bg-card hover:bg-accent transition-all text-left overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${action.color}`} />
                <div className="relative z-10 flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color} ${action.shadow} shrink-0`}>
                    <action.icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
                </div>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pending CP Proposals</h2>
            {pendingCPs.length > 0 && (
              <button
                onClick={() => navigate("/hod/cp-approvals")}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                View All
              </button>
            )}
          </div>
          {pendingCPs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <UserCheck size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No pending proposals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCPs.map((cp) => (
                <div
                  key={cp._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {cp.userId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cp.classId?.name || "No class"} • {cp.courseId?.name || "No course"}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/hod/cp-approvals")}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {recentActivity.length > 0 && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <FileText size={14} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.time).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
