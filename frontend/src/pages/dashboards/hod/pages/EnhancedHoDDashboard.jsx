/**
 * Enhanced HOD Dashboard
 * Department management with performance analytics
 */

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Navbar from "../../../../layouts/Navbar";
import Footer from "../../../../layouts/Footer";
import DashboardCard from "../../components/dashboards/DashboardCard";
import StatsGrid from "../../components/dashboards/StatsGrid";
import AnimatedCounter from "../../components/dashboards/AnimatedCounter";
import {
  DataPoint,
  ProgressBar,
  ActivityIndicator,
  MetricCard,
} from "../../components/dashboards/DataViz";

export default function EnhancedHoDDashboard() {
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

  const departmentActivity = [
    {
      title: "Dr. Johnson submitted event proposal",
      time: "30 mins ago",
      badge: "Proposal",
    },
    {
      title: "Faculty meeting rescheduled",
      time: "2 hours ago",
      badge: "Update",
    },
    {
      title: "15 students enrolled in advanced course",
      time: "5 hours ago",
      badge: "Enrollment",
    },
    {
      title: "Lab equipment maintenance completed",
      time: "1 day ago",
      badge: "Maintenance",
    },
  ];

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
            className="flex items-center gap-2 text-purple-400 text-sm font-bold uppercase tracking-wider mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BookOpen size={16} />
            <span>Department Head</span>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Department Dashboard
          </motion.h1>
          <motion.p
            className="text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Oversee department activities, faculty coordination, and student
            engagement
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
            <TrendingUp size={22} className="text-purple-400" />
            Department Overview
          </h2>
          <StatsGrid
            columns={4}
            cards={[
              <DashboardCard
                title="Active Faculty"
                value={<AnimatedCounter from={0} to={28} duration={1.5} />}
                change={2}
                color="from-purple-600 to-pink-500"
                icon={Users}
              />,
              <DashboardCard
                title="Enrolled Students"
                value={<AnimatedCounter from={0} to={542} duration={1.5} />}
                change={8}
                color="from-blue-600 to-cyan-500"
                icon={BookOpen}
              />,
              <DashboardCard
                title="Active Projects"
                value={<AnimatedCounter from={0} to={16} duration={1.5} />}
                change={4}
                color="from-green-600 to-emerald-500"
                icon={Target}
              />,
              <DashboardCard
                title="Dept. Rating"
                value={
                  <AnimatedCounter
                    from={0}
                    to={4.7}
                    duration={1.5}
                    decimals={1}
                    suffix="/5.0"
                  />
                }
                change={5}
                color="from-amber-600 to-orange-500"
                icon={Zap}
              />,
            ]}
          />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Faculty Performance */}
          <motion.div
            className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
            variants={itemVariants}
            whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-400" />
              Faculty Performance
            </h3>
            <div className="space-y-4">
              {[
                { name: "Dr. Alice Johnson", score: 95, courses: 3 },
                { name: "Prof. Bob Smith", score: 87, courses: 2 },
                { name: "Dr. Carol Davis", score: 92, courses: 3 },
                { name: "Asst. Prof. David Lee", score: 78, courses: 2 },
              ].map((faculty, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold text-white">{faculty.name}</p>
                      <p className="text-xs text-neutral-500">
                        {faculty.courses} courses
                      </p>
                    </div>
                    <span className="font-bold text-purple-400">
                      {faculty.score}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${faculty.score}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Stats */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <MetricCard
              title="Teaching Quality"
              metric="89%"
              description="Student satisfaction"
              gradient="from-purple-600 to-purple-400"
            />
            <MetricCard
              title="Research Output"
              metric="24"
              description="Publications this year"
              gradient="from-pink-600 to-pink-400"
            />
          </motion.div>
        </motion.div>

        {/* Bottom Section: Activity & Metrics */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
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
            <h3 className="text-lg font-bold mb-6">
              Recent Department Activity
            </h3>
            <ActivityIndicator items={departmentActivity} />
          </motion.div>

          {/* Course Info */}
          <motion.div
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
            variants={itemVariants}
            whileHover={{ borderColor: "rgba(255,255,255,0.2)", y: -4 }}
          >
            <h3 className="text-lg font-bold mb-6">Course Status</h3>
            <div className="space-y-4">
              <ProgressBar
                label="Undergrad"
                value={45}
                max={50}
                color="purple"
              />
              <ProgressBar label="Postgrad" value={28} max={30} color="pink" />
              <ProgressBar label="Online" value={12} max={15} color="blue" />
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {[
            {
              label: "Course Load",
              value: "8 courses",
              trend: 0,
              color: "blue",
            },
            {
              label: "Student Pass Rate",
              value: "94%",
              trend: 8,
              color: "green",
            },
            {
              label: "Research Grants",
              value: "₹5.2L",
              trend: 15,
              color: "purple",
            },
            {
              label: "Lab Utilization",
              value: "78%",
              trend: -3,
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
      </main>

      <Footer />
    </div>
  );
}
