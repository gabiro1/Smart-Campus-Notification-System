import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  BarChart3,
  ShieldCheck,
  Activity,
  Users,
  Star,
  PieChart as PieIcon,
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  Zap,
  Target,
  Eye,
  FileText,
  Search,
  Clock,
  User,
  Bell,
  Award,
  Mail,
  Send,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import adminService from "../../../../services/adminService";
import toast from "react-hot-toast";
import ThemedToaster from "../../../../components/ui/ThemedToaster";

const COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"];

const ACTION_ICONS = {
  CREATE_USER: <User size={14} />,
  UPDATE_USER: <User size={14} />,
  DELETE_USER: <User size={14} />,
  PROMOTE_USER: <Award size={14} />,
  CREATE_EVENT: <Calendar size={14} />,
  UPDATE_EVENT: <Calendar size={14} />,
  DELETE_EVENT: <Calendar size={14} />,
  CREATE_ANNOUNCEMENT: <Bell size={14} />,
  UPDATE_ANNOUNCEMENT: <Bell size={14} />,
  DELETE_ANNOUNCEMENT: <Bell size={14} />,
  BROADCAST_MESSAGE: <Mail size={14} />,
  SEND_SMS: <Send size={14} />,
  LOGIN: <Zap size={14} />,
  LOGOUT: <Zap size={14} />,
};

export default function FullAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsights, setAIInsights] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    preset: "7d",
  });

  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [insightsData, setInsightsData] = useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const filters = {};
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      if (actionFilter) filters.action = actionFilter;
      if (searchQuery) filters.adminId = searchQuery;

      const [analyticsRes, engagementRes, logsRes, insightsRes] = await Promise.all([
        adminService.getAnalytics(filters.startDate, filters.endDate),
        adminService.getEngagementByDepartment(),
        adminService.getAuditLogs(auditPage, 15, filters),
        adminService.getAIInsights()
      ]);

      const formattedEvents =
        analyticsRes.eventStats?.map((stat) => ({
          date: stat._id,
          events: stat.count,
        })) || [];

      const formattedRatings =
        analyticsRes.eventRatings?.map((rating) => ({
          stars: `${rating._id} Star`,
          count: rating.count,
        })) || [];

      setAnalytics({
        ...analyticsRes,
        eventStats: formattedEvents,
        eventRatings: formattedRatings,
        userEngagement: analyticsRes.userEngagement || { totalSent: 0, totalRead: 0 },
      });

      setEngagement(engagementRes.departments || []);
      setAuditLogs(logsRes.logs || []);
      setAuditTotalPages(logsRes.pagination?.pages || 1);
      
      // Set AI insights
      setInsightsData(insightsRes.data || null);
      setAIInsights(insightsRes.insights || []);
    } catch (error) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  const DATE_PRESETS = [
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchData();
  }, [auditPage, dateRange, actionFilter, searchQuery]);

  const handleDatePreset = (preset) => {
    const now = new Date();
    let start = new Date();

    switch (preset) {
      case "24h":
        start.setHours(now.getHours() - 24);
        break;
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      case "30d":
        start.setDate(now.getDate() - 30);
        break;
      case "90d":
        start.setDate(now.getDate() - 90);
        break;
      default:
        break;
    }

    setDateRange({
      preset,
      startDate: preset === "custom" ? "" : start.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    });
  };

  const handleExport = (format) => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`);
    setShowExportMenu(false);
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Activity className="text-purple-500" size={40} />
        </motion.div>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
          Compiling Intelligence...
        </p>
      </div>
    );
  }

  const readRate =
    analytics?.userEngagement?.totalSent > 0
      ? (
          (analytics.userEngagement.totalRead / analytics.userEngagement.totalSent) *
          100
        ).toFixed(1)
      : 0;

  const totalEvents = analytics?.eventStats?.reduce((sum, d) => sum + d.events, 0) || 0;
  const avgEventsPerDay = totalEvents / (analytics?.eventStats?.length || 1);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10">
      <ThemedToaster />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <BarChart3 className="text-purple-500" size={36} />
              Intelligence Hub
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              {insightsData ? (
                <>
                  <Sparkles size={14} className="text-purple-400" />
                  <span>{insightsData.totalUsers} users</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span>{insightsData.eventsCreated} events</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span>{insightsData.readRate}% read rate</span>
                </>
              ) : (
                "Analytics, engagement tracking, and audit compliance"
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Preset Buttons */}
            <div className="hidden md:flex bg-card border border-border rounded-xl p-1">
              {DATE_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleDatePreset(preset.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    dateRange.preset === preset.value
                      ? "bg-purple-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors"
            >
              <RefreshCw
                size={18}
                className={`text-muted-foreground ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </motion.button>

            {/* Export Button */}
            <div className="relative" ref={exportRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
              >
                <Download size={18} className="text-white" />
              </motion.button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {["CSV", "PDF", "JSON"].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-accent transition-colors"
                      >
                        Export {format}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
      >
        {[
          { id: "overview", label: "Overview", icon: <Activity size={16} /> },
          { id: "engagement", label: "Departments", icon: <Users size={16} /> },
          { id: "audit", label: "Audit Trail", icon: <ShieldCheck size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <KPICard
                title="Total Events"
                value={totalEvents}
                icon={<Calendar size={20} />}
                color="text-purple-500"
                bg="bg-purple-500/10"
              />
              <KPICard
                title="Avg Daily"
                value={avgEventsPerDay.toFixed(1)}
                icon={<Activity size={20} />}
                color="text-blue-500"
                bg="bg-blue-500/10"
              />
              <KPICard
                title="Notifications"
                value={analytics?.userEngagement?.totalSent || 0}
                icon={<Bell size={20} />}
                color="text-green-500"
                bg="bg-green-500/10"
              />
              <KPICard
                title="Read Rate"
                value={`${readRate}%`}
                icon={<Eye size={20} />}
                color="text-amber-500"
                bg="bg-amber-500/10"
              />
              <KPICard
                title="AI Insights"
                value={aiInsights.length}
                icon={<Sparkles size={20} />}
                color="text-cyan-400"
                bg="bg-cyan-500/10"
                showSparkles={aiInsights.length > 0}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Creation Trends */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border p-6 rounded-[24px] shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp size={18} className="text-purple-500" />
                    Events Over Time
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{totalEvents} total</span>
                    <span className="text-xs text-purple-400 font-bold">avg {avgEventsPerDay.toFixed(1)}/day</span>
                  </div>
                </div>
                
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.eventStats || []}>
                      <defs>
                        <linearGradient id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val ? val.slice(5) : ""}
                        dy={8}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-8}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                          padding: "8px 12px",
                        }}
                        formatter={(value) => [`${value} events`]}
                      />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#a855f7"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, fill: "#a855f7" }}
                        fillOpacity={1}
                        fill="url(#colorEvent)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Event Ratings */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border p-6 rounded-[24px] shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Star size={18} className="text-yellow-500" />
                    Event Ratings
                  </h3>
                  <span className="text-xs text-yellow-400 font-bold">
                    {analytics?.eventRatings?.reduce((s, r) => s + r.count, 0) || 0} votes
                  </span>
                </div>
                
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics?.eventRatings || []}
                      layout="vertical"
                      margin={{ left: 0 }}
                    >
                      <XAxis type="number" stroke="#666" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis
                        dataKey="stars"
                        type="category"
                        stroke="#666"
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                          padding: "8px 12px",
                        }}
                        formatter={(value) => [`${value} votes`]}
                      />
                      <Bar
                        dataKey="count"
                        fill="#eab308"
                        radius={[0, 8, 8, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* AI-Powered Insights */}
              {aiInsights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/20 p-6 rounded-[24px]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-purple-400" size={24} />
                    <h3 className="text-xl font-bold">AI Insights & Recommendations</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiInsights.slice(0, 6).map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          insight.priority === 'high' 
                            ? 'bg-red-500/5 border-red-500/20' 
                            : insight.priority === 'medium'
                            ? 'bg-amber-500/5 border-amber-500/20'
                            : 'bg-blue-500/5 border-blue-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb size={16} className={
                            insight.priority === 'high' ? 'text-red-400' : 
                            insight.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'
                          } />
                          <span className={`text-xs font-bold uppercase ${
                            insight.priority === 'high' ? 'text-red-400' : 
                            insight.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'
                          }`}>
                            {insight.priority}
                          </span>
                        </div>
                        <h4 className="font-bold text-foreground mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Notification Read Rate */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border p-6 rounded-[24px] shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Target size={18} className="text-green-500" />
                    Notification Impact
                  </h3>
                  <span className="text-xs text-muted-foreground bg-green-500/10 px-3 py-1 rounded-full">
                    Real-time
                  </span>
                </div>
                <div className="flex items-center justify-center h-[200px]">
                  <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#ffffff10"
                        strokeWidth="20"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={`${readRate * 5.02} 502`}
                        transform="rotate(-90 100 100)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-green-400">
                        {readRate}%
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        Read Rate
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <StatBox
                    label="Sent"
                    value={analytics?.userEngagement?.totalSent || 0}
                    color="text-blue-400"
                  />
                  <StatBox
                    label="Read"
                    value={analytics?.userEngagement?.totalRead || 0}
                    color="text-green-400"
                  />
                </div>
              </motion.div>

              {/* Engagement Score */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border p-6 rounded-[24px] shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" />
                    AI Engagement Score
                  </h3>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                      className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
                    >
                      {engagement.length > 0
                        ? Math.round(
                            engagement.reduce(
                              (sum, d) =>
                                sum + (parseFloat(d.readRate) || 0),
                              0
                            ) / engagement.length
                          )
                        : 0}
                    </motion.div>
                    <p className="text-muted-foreground mt-2">Overall Score</p>
                    <div className="flex justify-center gap-2 mt-4">
                      {engagement.slice(0, 5).map((dept, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {engagement.length} active departments
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* === DEPARTMENT ENGAGEMENT TAB === */}
        {activeTab === "engagement" && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PieIcon className="text-blue-500" size={24} />
                  <div>
                    <h3 className="text-xl font-bold">Department Engagement</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered personalization by department
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-bold border border-green-500/20">
                    High:{" "}
                    {engagement.filter((d) => d.recommendations === "High engagement")
                      .length}
                  </div>
                  <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-bold border border-amber-500/20">
                    Needs Work:{" "}
                    {engagement.filter(
                      (d) => d.recommendations !== "High engagement"
                    ).length}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-[10px] uppercase font-black text-muted-foreground tracking-widest border-b border-border">
                    <tr>
                      <th className="p-5">Department</th>
                      <th className="p-5">Users</th>
                      <th className="p-5">AI Tags</th>
                      <th className="p-5">Read Rate</th>
                      <th className="p-5">Progress</th>
                      <th className="p-5">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {engagement.map((dept, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-10 rounded-full"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span className="font-bold text-foreground">
                              {dept.department || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className="text-muted-foreground font-medium">
                            {dept.totalUsers?.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <Zap size={14} className="text-purple-400" />
                            <span className="text-purple-400 font-black">
                              {dept.avgInterests}
                            </span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span
                            className={`text-xl font-black ${
                              parseFloat(dept.readRate) >= 70
                                ? "text-green-400"
                                : parseFloat(dept.readRate) >= 40
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {dept.readRate}%
                          </span>
                        </td>
                        <td className="p-5 w-48">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Engagement
                              </span>
                              <span className="font-bold">{dept.readRate}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${dept.readRate}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className={`h-full rounded-full ${
                                  parseFloat(dept.readRate) >= 70
                                    ? "bg-green-500"
                                    : parseFloat(dept.readRate) >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                              dept.recommendations === "High engagement"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {dept.recommendations === "High engagement" ? (
                              <CheckCircle size={12} className="inline mr-1" />
                            ) : (
                              <AlertTriangle size={12} className="inline mr-1" />
                            )}
                            {dept.recommendations}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* === AUDIT LOGS TAB === */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-border p-5 rounded-2xl mb-6 flex items-start gap-4"
            >
              <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-lg">Immutable Audit Ledger</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Every system action is permanently recorded. This data cannot be
                  modified or deleted, ensuring institutional compliance and
                  accountability.
                </p>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-[24px] overflow-hidden shadow-2xl mb-6">
              <div className="p-5 border-b border-border flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by admin email..."
                      className="w-full bg-accent border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-accent border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE_USER">Create User</option>
                  <option value="UPDATE_USER">Update User</option>
                  <option value="DELETE_USER">Delete User</option>
                  <option value="PROMOTE_USER">Promote User</option>
                  <option value="CREATE_EVENT">Create Event</option>
                  <option value="DELETE_EVENT">Delete Event</option>
                  <option value="CREATE_BACKUP">Create Backup</option>
                  <option value="RESTORE_BACKUP">Restore Backup</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                </select>

                <button
                  onClick={() => {
                    setActionFilter("");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-foreground rounded-xl text-sm font-bold transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.02] text-[10px] uppercase font-black text-muted-foreground tracking-widest border-b border-border">
                    <tr>
                      <th className="p-5">Timestamp</th>
                      <th className="p-5">Admin</th>
                      <th className="p-5">Action Type</th>
                      <th className="p-5">Details</th>
                      <th className="p-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FileText
                              size={40}
                              className="text-muted-foreground/30"
                            />
                            <p className="text-muted-foreground">
                              No audit logs found.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log, idx) => (
                        <motion.tr
                          key={log._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <Clock
                                size={14}
                                className="text-muted-foreground"
                              />
                              <span className="text-xs text-muted-foreground font-mono">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                {log.adminId?.name?.charAt(0) || "S"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">
                                  {log.adminId?.name || "System"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.adminId?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`p-2 rounded-lg ${
                                  log.action?.includes("DELETE")
                                    ? "bg-red-500/10 text-red-400"
                                    : log.action?.includes("CREATE")
                                    ? "bg-green-500/10 text-green-400"
                                    : log.action?.includes("PROMOTE")
                                    ? "bg-purple-500/10 text-purple-400"
                                    : log.action?.includes("LOGIN")
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {ACTION_ICONS[log.action] || (
                                  <FileText size={14} />
                                )}
                              </span>
                              <span className="text-sm font-medium">
                                {log.action?.replace(/_/g, " ")}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 max-w-xs">
                            <p className="text-sm text-neutral-300 font-medium truncate">
                              {log.description}
                            </p>
                          </td>
                          <td className="p-5">
                            <span
                              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                                log.status === "SUCCESS"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              <CheckCircle
                                size={12}
                                className="inline mr-1"
                              />
                              {log.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditTotalPages > 1 && (
                <div className="p-4 border-t border-border flex items-center justify-between bg-white/[0.01]">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Page {auditPage} of {auditTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                      disabled={auditPage === 1}
                      className="px-4 py-2 bg-accent hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setAuditPage((p) => Math.min(auditTotalPages, p + 1))
                      }
                      disabled={auditPage === auditTotalPages}
                      className="px-4 py-2 bg-accent hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KPICard({ title, value, icon, color, bg, showSparkles }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border border-border p-5 rounded-[24px] shadow-xl"
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
          {title}
        </h4>
        <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-black tracking-tighter">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {showSparkles && <Sparkles size={16} className="text-purple-400 animate-pulse" />}
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground uppercase mt-1">{label}</p>
    </div>
  );
}