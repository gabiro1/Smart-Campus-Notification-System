import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  ShieldCheck,
  Activity,
  Users,
  Star,
  PieChart as PieIcon,
  List,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import adminService from "../../../../services/adminService"; // Adjust path
import toast, { Toaster } from "react-hot-toast";

export default function FullAnalytics() {
  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics', 'engagement', 'audit'
  const [loading, setLoading] = useState(true);

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [analyticsData, engagementData, logsData] = await Promise.all([
        adminService.getAnalytics(), // Add date filters here later if needed
        adminService.getEngagementByDepartment(),
        adminService.getAuditLogs(auditPage, 15),
      ]);

      // Map backend data to Recharts format
      const formattedEventStats =
        analyticsData.eventStats?.map((stat) => ({
          date: stat._id,
          events: stat.count,
        })) || [];

      const formattedRatings =
        analyticsData.eventRatings?.map((rating) => ({
          stars: `${rating._id} Star`,
          count: rating.count,
        })) || [];

      setAnalytics({
        ...analyticsData,
        eventStats: formattedEventStats,
        eventRatings: formattedRatings,
      });
      setEngagement(engagementData.departments || []);
      setAuditLogs(logsData.logs || []);
      setAuditTotalPages(logsData.pagination?.pages || 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load analytics data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [auditPage]);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Activity className="animate-spin text-purple-500" size={40} />
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">
          Compiling Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12">
      <Toaster theme="dark" position="top-right" />

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <BarChart3 className="text-purple-500" size={36} /> Intelligence
          </h1>
          <p className="text-neutral-500 mt-1">
            System performance, engagement metrics, and audit trails.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex bg-[#0D0D0D] border border-white/5 rounded-2xl p-1"
        >
          <TabButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={<Activity size={16} />}
            label="Overview"
          />
          <TabButton
            active={activeTab === "engagement"}
            onClick={() => setActiveTab("engagement")}
            icon={<Users size={16} />}
            label="Departments"
          />
          <TabButton
            active={activeTab === "audit"}
            onClick={() => setActiveTab("audit")}
            icon={<ShieldCheck size={16} />}
            label="Audit Logs"
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- TAB 1: OVERVIEW ANALYTICS --- */}
        {activeTab === "analytics" && analytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart: Event Creation Trends */}
              <div className="bg-[#0D0D0D] border border-white/5 p-6 rounded-[24px] shadow-xl h-[400px]">
                <h3 className="text-lg font-bold mb-6 text-neutral-300">
                  Event Volume
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={analytics.eventStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ffffff05"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="events"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#a855f7", strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart: Ratings Distribution */}
              <div className="bg-[#0D0D0D] border border-white/5 p-6 rounded-[24px] shadow-xl h-[400px]">
                <h3 className="text-lg font-bold mb-6 text-neutral-300 flex items-center gap-2">
                  <Star size={18} className="text-yellow-500" /> Supervised
                  Learning (Ratings)
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart
                    data={analytics.eventRatings}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ffffff05"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="stars"
                      type="category"
                      stroke="#aaa"
                      tick={{ fontSize: 12, fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={{
                        backgroundColor: "#111",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
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
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: DEPARTMENT ENGAGEMENT --- */}
        {activeTab === "engagement" && (
          <motion.div
            key="engagement"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-[#0D0D0D] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <PieIcon className="text-blue-500" size={20} />
                <h3 className="text-lg font-bold text-neutral-300">
                  AI Engagement & Read Rates by Department
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.02] text-[10px] uppercase font-black text-neutral-500 tracking-widest border-b border-white/5">
                    <tr>
                      <th className="p-6">Department</th>
                      <th className="p-6">User Base</th>
                      <th className="p-6">Avg AI Interests</th>
                      <th className="p-6">Notification Read Rate</th>
                      <th className="p-6">System Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {engagement.map((dept, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-6 font-bold text-white">
                          {dept.department || "Unassigned"}
                        </td>
                        <td className="p-6 text-neutral-400 font-medium">
                          {dept.totalUsers.toLocaleString()}
                        </td>
                        <td className="p-6 text-blue-400 font-black">
                          {dept.avgInterests} tags
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-white w-12">
                              {dept.readRate}%
                            </span>
                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${dept.readRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                              dept.recommendations === "High engagement"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {dept.recommendations}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 3: AUDIT LOGS --- */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-[#111] border border-white/5 p-4 rounded-xl text-sm flex items-start gap-3 mb-6 text-neutral-400">
              <ShieldCheck
                size={18}
                className="shrink-0 mt-0.5 text-blue-500"
              />
              <p>
                This is an immutable ledger. All creation, modification,
                deletion, and role elevations are permanently recorded here for
                institutional compliance.
              </p>
            </div>

            <div className="bg-[#0D0D0D] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.02] text-[10px] uppercase font-black text-neutral-500 tracking-widest border-b border-white/5">
                    <tr>
                      <th className="p-6">Timestamp</th>
                      <th className="p-6">Actor (Admin)</th>
                      <th className="p-6">Action</th>
                      <th className="p-6">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-8 text-center text-neutral-500"
                        >
                          No logs found.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr
                          key={log._id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-6 text-xs text-neutral-500 font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-6">
                            <div className="text-sm font-bold text-white">
                              {log.adminId?.name || "System"}
                            </div>
                            <div className="text-[10px] text-neutral-500 uppercase">
                              {log.adminId?.email}
                            </div>
                          </td>
                          <td className="p-6">
                            <span
                              className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${
                                log.action.includes("DELETE")
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : log.action.includes("CREATE")
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : log.action.includes("PROMOTE")
                                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {log.action.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-neutral-300 font-medium">
                            {log.description}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Audit Log Pagination */}
              {auditTotalPages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider pl-4">
                    Page {auditPage} of {auditTotalPages}
                  </span>
                  <div className="flex gap-2 pr-2">
                    <button
                      onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                      disabled={auditPage === 1}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setAuditPage((p) => Math.min(auditTotalPages, p + 1))
                      }
                      disabled={auditPage === auditTotalPages}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
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

// Custom Tab Button
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
        active
          ? "bg-white/10 text-white shadow-sm"
          : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
      }`}
    >
      {icon} {label}
    </button>
  );
}
