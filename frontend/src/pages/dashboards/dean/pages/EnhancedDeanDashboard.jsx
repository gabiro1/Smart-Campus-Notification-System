/**
 * Enhanced Dean Dashboard
 * Faculty oversight with approval workflows and analytics
 */

import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  GitBranch,
} from "lucide-react";
import Navbar from "../../../../layouts/Navbar";
import Footer from "../../../../layouts/Footer";
import DashboardCard from "../../components/dashboards/DashboardCard";
import StatsGrid from "../../components/dashboards/StatsGrid";
import AnimatedCounter from "../../components/dashboards/AnimatedCounter";
import {
  MetricCard,
  ProgressBar,
  ActivityIndicator,
} from "../../components/dashboards/DataViz";
import ApprovalQueue from "../../../../shared/ApprovalQueue";

export default function EnhancedDeanDashboard() {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 p-8 pt-32 max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-wider mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GitBranch size={16} />
            <span>Faculty Management</span>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            School Dean Console
          </motion.h1>
          <motion.p
            className="text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Manage departmental pulses, approvals, and ensure school-wide
            coordination
          </motion.p>
        </motion.header>

        {/* Key Metrics */}
        <motion.div
          className="mb-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={22} className="text-blue-400" />
            Key Metrics
          </h2>
          <StatsGrid
            columns={4}
            cards={[
              <DashboardCard
                title="Pending Approvals"
                value={<AnimatedCounter from={0} to={8} duration={1.5} />}
                change={2}
                color="from-amber-600 to-orange-500"
                icon={Clock}
              />,
              <DashboardCard
                title="Approved Events"
                value={<AnimatedCounter from={0} to={142} duration={1.5} />}
                change={12}
                color="from-green-600 to-emerald-500"
                icon={CheckCircle2}
              />,
              <DashboardCard
                title="Active Departments"
                value={<AnimatedCounter from={0} to={12} duration={1.5} />}
                change={0}
                color="from-blue-600 to-cyan-500"
                icon={Users}
              />,
              <DashboardCard
                title="Overall Health"
                value={
                  <AnimatedCounter from={0} to={95} duration={1.5} suffix="%" />
                }
                change={3}
                color="from-purple-600 to-pink-500"
                icon={Zap}
              />,
            ]}
          />
        </motion.div>

        {/* Approval Queue */}
        <motion.section
          className="mb-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={itemVariants}>
            <ApprovalQueue />
          </motion.div>
        </motion.section>

        {/* Analytics Row */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Departmental Overview */}
          <motion.div
            className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
            variants={itemVariants}
            whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
          >
            <h3 className="text-lg font-bold mb-6">Department Performance</h3>
            <div className="space-y-4">
              {[
                { dept: "Computer Science", score: 92, color: "blue" },
                { dept: "Engineering", score: 87, color: "purple" },
                { dept: "Business Studies", score: 79, color: "green" },
                { dept: "Natural Sciences", score: 85, color: "amber" },
              ].map((dept, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <ProgressBar
                    label={dept.dept}
                    value={dept.score}
                    max={100}
                    color={dept.color}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <MetricCard
              title="Coordination Efficiency"
              metric="94%"
              description="Inter-departmental"
              gradient="from-blue-600 to-blue-400"
            />
            <MetricCard
              title="Event Success Rate"
              metric="87%"
              description="On-time execution"
              gradient="from-green-600 to-green-400"
            />
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
