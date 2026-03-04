/**
 * Enhanced Principal Dashboard
 * Institution-wide strategic overview
 */

import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Users,
  Building2,
  Trophy,
  Zap,
  Globe,
  Crown,
} from "lucide-react";
import Navbar from "../../../../layouts/Navbar";
import Footer from "../../../../layouts/Footer";
import DashboardCard from "../../components/dashboards/DashboardCard";
import StatsGrid from "../../components/dashboards/StatsGrid";
import AnimatedCounter from "../../components/dashboards/AnimatedCounter";
import {
  DataPoint,
  ProgressBar,
  MetricCard,
} from "../../components/dashboards/DataViz";

export default function EnhancedPrincipalDashboard() {
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
            className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Crown size={16} />
            <span>Principal Leadership</span>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Institution Strategic Dashboard
          </motion.h1>
          <motion.p
            className="text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Institution-wide performance metrics and strategic initiatives
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
            <Target size={22} className="text-amber-400" />
            Institution Health
          </h2>
          <StatsGrid
            columns={4}
            cards={[
              <DashboardCard
                title="Total Students"
                value={<AnimatedCounter from={0} to={8500} duration={1.8} />}
                change={12}
                color="from-amber-600 to-orange-500"
                icon={Users}
              />,
              <DashboardCard
                title="Departments"
                value={<AnimatedCounter from={0} to={18} duration={1.8} />}
                change={0}
                color="from-blue-600 to-cyan-500"
                icon={Building2}
              />,
              <DashboardCard
                title="Avg. Rating"
                value={
                  <AnimatedCounter
                    from={0}
                    to={4.6}
                    duration={1.8}
                    decimals={1}
                    suffix="/5.0"
                  />
                }
                change={8}
                color="from-green-600 to-emerald-500"
                icon={Trophy}
              />,
              <DashboardCard
                title="System Status"
                value={
                  <AnimatedCounter
                    from={0}
                    to={99.8}
                    duration={1.8}
                    decimals={1}
                    suffix="%"
                  />
                }
                change={1}
                color="from-purple-600 to-pink-500"
                icon={Zap}
              />,
            ]}
          />
        </motion.div>

        {/* Strategic Overview */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Academic Performance */}
          <motion.div
            className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
            variants={itemVariants}
            whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Globe size={20} className="text-amber-400" />
              Academic Metrics by School
            </h3>
            <div className="space-y-4">
              {[
                { school: "School of Engineering", score: 94, students: 2100 },
                { school: "School of Business", score: 88, students: 1850 },
                { school: "School of Sciences", score: 91, students: 1650 },
                { school: "School of Humanities", score: 85, students: 1400 },
                { school: "School of Health", score: 93, students: 1500 },
              ].map((school, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {school.school}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {school.students} students
                      </p>
                    </div>
                    <span className="font-bold text-amber-400">
                      {school.score}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-600 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${school.score}%` }}
                      transition={{ duration: 1.2, delay: idx * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strategic Initiatives */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <MetricCard
              title="Research Excellence"
              metric="342"
              description="Papers published"
              gradient="from-amber-600 to-amber-400"
            />
            <MetricCard
              title="Global Rankings"
              metric="Top 15"
              description="In region"
              gradient="from-orange-600 to-orange-400"
            />
          </motion.div>
        </motion.div>

        {/* Key Initiatives & Planning */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {[
            { title: "Campus Expansion", progress: 65, status: "In Progress" },
            {
              title: "Digital Transformation",
              progress: 48,
              status: "In Progress",
            },
            { title: "Research Grants", progress: 92, status: "Secured" },
            {
              title: "Infrastructure Update",
              progress: 78,
              status: "On Track",
            },
          ].map((initiative, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
              variants={itemVariants}
              whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
            >
              <h4 className="font-bold text-white mb-4">{initiative.title}</h4>
              <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-600 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${initiative.progress}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">
                  {initiative.progress}%
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    initiative.status === "Secured"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {initiative.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Performance Dashboard */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Key Indicators */}
          <motion.div
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
            variants={itemVariants}
            whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
          >
            <h3 className="text-lg font-bold mb-6">
              Key Performance Indicators
            </h3>
            <div className="space-y-4">
              <ProgressBar
                label="Student Satisfaction"
                value={87}
                max={100}
                color="amber"
              />
              <ProgressBar
                label="Faculty Retention"
                value={92}
                max={100}
                color="orange"
              />
              <ProgressBar
                label="Placement Rate"
                value={89}
                max={100}
                color="blue"
              />
              <ProgressBar
                label="Alumni Success"
                value={94}
                max={100}
                color="green"
              />
            </div>
          </motion.div>

          {/* Institutional Stats */}
          <motion.div className="space-y-4" variants={itemVariants}>
            {[
              {
                label: "Faculty Count",
                value: "450+",
                trend: 5,
                color: "blue",
              },
              {
                label: "Annual Budget",
                value: "₹50Cr",
                trend: 8,
                color: "green",
              },
              {
                label: "Placement %",
                value: "89%",
                trend: 12,
                color: "purple",
              },
              {
                label: "Int'l Collaborations",
                value: "35",
                trend: 15,
                color: "amber",
              },
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
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
