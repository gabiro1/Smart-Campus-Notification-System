import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  MessageCircle,
  Award,
  Clock,
  CheckCircle,
  Filter,
  Download,
  Bell,
  Settings,
  Plus,
} from "lucide-react";
import DashboardCard from "../../../../components/dashboards/DashboardCard";
import AnimatedCounter from "../../../../components/dashboards/AnimatedCounter";
import StatsGrid from "../../../../components/dashboards/StatsGrid";
import {
  MetricCard,
  ProgressBar,
  DataPoint,
  ActivityIndicator,
} from "../../../../components/dashboards/DataViz";
import Navbar from "../../../../layouts/Navbar";
import Footer from "../../../../layouts/Footer";

const EnhancedLecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Mock data
  const stats = {
    courses: 4,
    students: 127,
    avgRating: 4.6,
    eventsConducted: 12,
  };

  const coursesList = [
    {
      id: 1,
      name: "Web Development",
      students: 45,
      rating: 4.7,
      status: "Active",
    },
    {
      id: 2,
      name: "Data Structures",
      students: 38,
      rating: 4.5,
      status: "Active",
    },
    {
      id: 3,
      name: "Database Design",
      students: 32,
      rating: 4.6,
      status: "Active",
    },
    {
      id: 4,
      name: "AI & ML Basics",
      students: 12,
      rating: 4.8,
      status: "Upcoming",
    },
  ];

  const recentActivity = [
    {
      type: "assignment",
      course: "Web Development",
      title: "Assignment 3 Submitted",
      time: "2 hours ago",
    },
    {
      type: "feedback",
      course: "Data Structures",
      title: "Grades Posted",
      time: "5 hours ago",
    },
    {
      type: "event",
      course: "Database Design",
      title: "Workshop Scheduled",
      time: "1 day ago",
    },
    {
      type: "message",
      course: "AI & ML Basics",
      title: "5 New Student Messages",
      time: "2 days ago",
    },
    {
      type: "event",
      course: "Web Development",
      title: "Guest Lecture Confirmed",
      time: "3 days ago",
    },
  ];

  const eventsConducted = [
    {
      name: "Guest Session: Cloud Computing",
      date: "Dec 15, 2024",
      students: 45,
      rating: 4.8,
    },
    {
      name: "Hands-on Workshop: React",
      date: "Dec 10, 2024",
      students: 38,
      rating: 4.6,
    },
    {
      name: "Seminar: Career in Tech",
      date: "Dec 5, 2024",
      students: 67,
      rating: 4.7,
    },
  ];

  const statCards = [
    {
      title: "Active Courses",
      value: <AnimatedCounter from={0} to={stats.courses} duration={2} />,
      change: 0,
      color: "from-purple-600 to-pink-500",
      icon: BookOpen,
    },
    {
      title: "Total Students",
      value: <AnimatedCounter from={0} to={stats.students} duration={2} />,
      change: 12,
      color: "from-blue-600 to-cyan-500",
      icon: Users,
    },
    {
      title: "Average Rating",
      value: <span className="text-3xl font-bold">{stats.avgRating}</span>,
      change: 5,
      color: "from-amber-500 to-orange-500",
      icon: Star,
    },
    {
      title: "Events Conducted",
      value: (
        <AnimatedCounter from={0} to={stats.eventsConducted} duration={2} />
      ),
      change: 25,
      color: "from-green-600 to-emerald-500",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Teaching Dashboard
              </h1>
              <p className="text-purple-200">
                Manage courses and track student progress
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-purple-700/50 rounded-lg transition-colors duration-200"
              >
                <Bell className="w-6 h-6 text-purple-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-purple-700/50 rounded-lg transition-colors duration-200"
              >
                <Settings className="w-6 h-6 text-purple-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {["overview", "courses", "events", "messages"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                  : "bg-slate-800/50 text-purple-200 hover:bg-slate-700/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Key Metrics */}
        {activeTab === "overview" && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-8 mb-8"
          >
            {/* Stats Grid */}
            <StatsGrid columns={4} cards={statCards} />

            {/* Course Performance and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Performance */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Course Performance
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-purple-700/50 rounded-lg transition-colors"
                  >
                    <Filter className="w-5 h-5 text-purple-300" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {coursesList.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">
                            {course.name}
                          </p>
                          <p className="text-sm text-purple-300">
                            {course.students} students
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-400">
                            {course.rating} / 5.0
                          </p>
                          <p className="text-xs text-purple-300">
                            {course.status}
                          </p>
                        </div>
                      </div>
                      <ProgressBar
                        value={course.students * 2.2}
                        max={100}
                        color="purple"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="space-y-4">
                <MetricCard
                  title="Class Participation"
                  metric="89%"
                  gradient="from-purple-600 to-pink-500"
                />
                <MetricCard
                  title="Assignment Completion"
                  metric="94%"
                  gradient="from-blue-600 to-cyan-500"
                />
                <MetricCard
                  title="Student Satisfaction"
                  metric="4.6/5"
                  gradient="from-amber-500 to-orange-500"
                />
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Recent Activity
              </h2>
              <ActivityIndicator items={recentActivity} max={5} />
            </motion.div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {coursesList.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 backdrop-blur-sm cursor-pointer transition-all duration-300"
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-purple-300">{course.status}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <BookOpen className="w-8 h-8 text-purple-500" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <DataPoint
                      label="Students"
                      value={course.students}
                      color="blue"
                    />
                    <DataPoint
                      label="Rating"
                      value={course.rating}
                      color="amber"
                    />
                  </div>
                  <ProgressBar value={85} max={100} color="purple" />

                  <div className="flex gap-2 pt-4 border-t border-purple-500/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
                    >
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-purple-300 py-2 rounded-lg transition-colors"
                    >
                      Manage
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Events Conducted
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </motion.button>
            </div>

            {eventsConducted.map((event, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {event.name}
                    </h3>
                    <div className="flex gap-4">
                      <p className="text-sm text-purple-300 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.date}
                      </p>
                      <p className="text-sm text-purple-300 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.students} attendees
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-400">
                      {event.rating}
                    </p>
                    <p className="text-xs text-purple-300">Rating</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-8 border border-purple-500/20 backdrop-blur-sm text-center"
          >
            <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <p className="text-purple-300">
              Messages from students appear here
            </p>
          </motion.div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <motion.div
        className="fixed bottom-8 right-8 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:shadow-purple-500/50 transition-shadow"
        >
          <Award className="w-6 h-6" />
        </motion.button>
      </motion.div>

      <Footer />
    </div>
  );
};

export default EnhancedLecturerDashboard;
