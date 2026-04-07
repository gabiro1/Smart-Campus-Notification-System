import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, TrendingUp, Target, Eye, Mail, Send } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import announcementService from "../../services/announcementService";
import toast from "react-hot-toast";

const COLORS = {
  read: "#10b981",   // green-500
  unread: "#6b7280", // gray-500
  delivered: "#3b82f6", // blue-500
};

export default function AnnouncementAnalytics({ announcementId, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (announcementId) {
      fetchAnalytics();
    }
  }, [announcementId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await announcementService.getAnnouncementAnalytics(announcementId);
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.message || "Failed to load analytics");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
      console.error("[AnnouncementAnalytics] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const pieData = analytics ? [
    { name: 'Read', value: analytics.read, color: COLORS.read },
    { name: 'Unread', value: analytics.unread, color: COLORS.unread }
  ] : [];

  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);
  const formatPercent = (num) => `${num?.toFixed(1) || 0}%`;

  return (
    <AnimatePresence>
      {announcementId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl glass border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <BarChart3 className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Announcement Analytics</h2>
                  {analytics?.announcement && (
                    <p className="text-sm text-neutral-400 truncate max-w-md">
                      {analytics.announcement.title}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}

              {error && (
                <div className="text-center py-20">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && analytics && (
                <div className="space-y-8">
                  {/* Stat Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Sent"
                      value={analytics.totalSent}
                      icon={<Send className="text-blue-400" size={20} />}
                      subtitle={`${formatPercent(analytics.deliveryRate)} delivered`}
                    />
                    <StatCard
                      label="Delivered"
                      value={analytics.delivered}
                      icon={<Mail className="text-green-400" size={20} />}
                      subtitle="Reached device"
                    />
                    <StatCard
                      label="Opened / Read"
                      value={analytics.read}
                      icon={<Eye className="text-purple-400" size={20} />}
                      subtitle={formatPercent(analytics.readRate)}
                      showPercent
                    />
                    <StatCard
                      label="Unread"
                      value={analytics.unread}
                      icon={<Target className="text-neutral-400" size={20} />}
                      subtitle="Yet to view"
                    />
                  </div>

                  {/* Charts Row */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Donut Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">
                        Engagement Overview
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                              formatter={(value) => [formatNumber(value), 'Count']}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => <span className="text-neutral-300 text-sm">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">
                        Key Insights
                      </h3>
                      <div className="space-y-4">
                        <InsightCard
                          icon={<TrendingUp className="text-green-400" size={20} />}
                          label="Read Rate"
                          value={formatPercent(analytics.readRate)}
                          description={`${analytics.read} out of ${analytics.totalSent} students opened this announcement`}
                        />
                        <InsightCard
                          icon={<Mail className="text-blue-400" size={20} />}
                          label="Delivery Success"
                          value={formatPercent(analytics.deliveryRate)}
                          description={`${analytics.delivered} notifications successfully delivered`}
                        />
                        <InsightCard
                          icon={<Target className="text-purple-400" size={20} />}
                          label="Unreached"
                          value={analytics.unread}
                          description={`${analytics.unread} students haven't seen this yet`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, subtitle, showPercent = false }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {showPercent && subtitle && (
          <span className="text-sm text-neutral-400">{subtitle}</span>
        )}
      </div>
      {subtitle && !showPercent && (
        <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function InsightCard({ icon, label, value, description }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
      <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-300">{label}</span>
          <span className="text-lg font-black text-white">{value}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
