/**
 * Enhanced Professional Admin Dashboard
 * Modern design with animations and interactive elements
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  AlertCircle,
  Activity,
  Zap,
  Award,
  Filter,
  Search,
  Download,
  Settings,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import DashboardCard from "../../components/dashboards/DashboardCard";
import StatsGrid from "../../components/dashboards/StatsGrid";
import AnimatedCounter from "../../components/dashboards/AnimatedCounter";
import {
  DataPoint,
  ProgressBar,
  ActivityIndicator,
  MetricCard,
} from "../../components/dashboards/DataViz";

export default function EnhancedAdminDashboard() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const recentActivities = [
    { title: "New event created by HOD", time: "2 mins ago", badge: "New" },
    {
      title: "User registration spike detected",
      time: "15 mins ago",
      badge: "Alert",
    },
    { title: "System backup completed", time: "1 hour ago", badge: "Done" },
    {
      title: "AI model updated successfully",
      time: "2 hours ago",
      badge: "Update",
    },
    { title: "Network metrics normalized", time: "3 hours ago", badge: "Info" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] text-white">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8">
          {/* Header Section */}
          <motion.header
            className="mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <motion.div
                  className="flex items-center gap-2 text-[11px] text-blue-400 tracking-widest uppercase mb-2 font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Zap size={14} />
                  <span>Admin Console</span>
                </motion.div>
                <motion.h1
                  className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  System Dashboard
                </motion.h1>
                <motion.p
                  className="text-neutral-400 mt-2 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Real-time system monitoring and analytics
                </motion.p>
              </div>

              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                  <Download size={18} />
                </button>
                <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                  <Settings size={18} />
                </button>
              </motion.div>
            </div>

            {/* Tabs */}
            <motion.div
              className="flex gap-3 border-b border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {["overview", "analytics", "security", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </motion.div>
          </motion.header>

          {/* Search & Filter Bar */}
          <motion.div
            className="flex gap-3 mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                size={18}
              />
              <input
                type="text"
                placeholder="Search metrics, users, events..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-400/50 transition-all placeholder:text-neutral-600"
              />
            </div>
            <motion.button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={18} />
              Filter
            </motion.button>
          </motion.div>

          {/* Main Stats Grid */}
          <motion.div
            className="mb-8"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={22} className="text-blue-400" />
              Key Metrics
            </h2>

            <StatsGrid
              columns={4}
              cards={[
                <DashboardCard
                  title="Active Alerts"
                  value={<AnimatedCounter from={0} to={12} duration={2} />}
                  subtitle="real-time"
                  change={15}
                  color="from-blue-600 to-cyan-500"
                  icon={AlertCircle}
                />,
                <DashboardCard
                  title="Total Users"
                  value={<AnimatedCounter from={0} to={4250} duration={2} />}
                  subtitle="across campus"
                  change={8}
                  color="from-green-600 to-emerald-500"
                  icon={Users}
                />,
                <DashboardCard
                  title="AI Accuracy"
                  value={
                    <AnimatedCounter
                      from={0}
                      to={94.2}
                      duration={2}
                      decimals={1}
                      suffix="%"
                    />
                  }
                  subtitle="matching"
                  change={5}
                  color="from-purple-600 to-pink-500"
                  icon={Zap}
                />,
                <DashboardCard
                  title="System Health"
                  value={
                    <AnimatedCounter
                      from={0}
                      to={99.8}
                      duration={2}
                      decimals={1}
                      suffix="%"
                    />
                  }
                  subtitle="uptime"
                  change={2}
                  color="from-amber-600 to-orange-500"
                  icon={Activity}
                />,
              ]}
            />
          </motion.div>

          {/* Charts Row */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {/* Main Chart */}
            <motion.div
              className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
              variants={itemVariants}
              whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-400" />
                  Engagement Trends
                </h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">
                  ↑ 12% increase
                </span>
              </div>

              {/* Placeholder for actual chart */}
              <div className="h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <BarChart3
                    size={48}
                    className="text-neutral-700 mx-auto mb-3"
                  />
                  <p className="text-neutral-600">Chart visualization area</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <MetricCard
                title="Events Created"
                metric="247"
                description="Last 30 days"
                icon={Award}
                gradient="from-blue-600 to-blue-400"
              />
              <MetricCard
                title="Engagement Rate"
                metric="84%"
                description="Users interacting"
                gradient="from-green-600 to-green-400"
              />
            </motion.div>
          </motion.div>

          {/* Bottom Section: Activity & Performance */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {/* Recent Activity */}
            <motion.div
              className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
              variants={itemVariants}
              whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Activity size={20} className="text-blue-400" />
                Recent Activity
              </h3>
              <ActivityIndicator items={recentActivities} />
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
              variants={itemVariants}
              whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
            >
              <h3 className="text-lg font-bold mb-6">Performance</h3>
              <div className="space-y-4">
                <ProgressBar label="Server Load" value={65} color="blue" />
                <ProgressBar label="Database" value={48} color="green" />
                <ProgressBar label="Memory" value={72} color="amber" />
                <ProgressBar label="API Health" value={95} color="purple" />
              </div>
            </motion.div>
          </motion.div>

          {/* Footer Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {[
              { label: "CPU Usage", value: "42%", trend: 5, color: "blue" },
              {
                label: "Network",
                value: "156 Mbps",
                trend: -3,
                color: "green",
              },
              {
                label: "Requests/s",
                value: "1.2K",
                trend: 12,
                color: "purple",
              },
              { label: "Errors/min", value: "3", trend: -8, color: "red" },
            ].map((stat, idx) => (
              <DataPoint
                key={idx}
                label={stat.label}
                value={stat.value}
                trend={stat.trend}
                color={stat.color}
              />
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
