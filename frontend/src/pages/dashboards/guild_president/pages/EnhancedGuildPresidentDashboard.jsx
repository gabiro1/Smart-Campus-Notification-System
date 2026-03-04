import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, Award, TrendingUp,
  Heart, Share2, MessageSquare, Plus,
  Filter, Download, Bell, Settings,
  Target, BarChart3, Clock, CheckCircle2
} from 'lucide-react';
import DashboardCard from '../../../../components/dashboards/DashboardCard';
import AnimatedCounter from '../../../../components/dashboards/AnimatedCounter';
import StatsGrid from '../../../../components/dashboards/StatsGrid';
import { MetricCard, ProgressBar, DataPoint, ActivityIndicator } 
  from '../../../../components/dashboards/DataViz';
import Navbar from '../../../../layouts/Navbar';
import Footer from '../../../../layouts/Footer';

const EnhancedGuildPresidentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);

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
    members: 342,
    activeEvents: 8,
    participation: 76,
    engagement: 8.4
  };

  const upcomingEvents = [
    { 
      id: 1, 
      name: 'Annual Fest Preparation', 
      date: 'Dec 20-25, 2024', 
      participants: 45,
      category: 'Cultural',
      status: 'In Progress'
    },
    { 
      id: 2, 
      name: 'Tech Talk Series', 
      date: 'Dec 22, 2024', 
      participants: 28,
      category: 'Learning',
      status: 'Scheduled'
    },
    { 
      id: 3, 
      name: 'Sports Championship', 
      date: 'Dec 28, 2024', 
      participants: 67,
      category: 'Sports',
      status: 'Planning'
    },
    { 
      id: 4, 
      name: 'Career Fair', 
      date: 'Jan 5, 2025', 
      participants: 120,
      category: 'Professional',
      status: 'Scheduled'
    },
  ];

  const memberEngagement = [
    { name: 'Alice Johnson', role: 'Vice President', events: 12, engagement: 95 },
    { name: 'Bob Smith', role: 'Treasurer', events: 8, engagement: 87 },
    { name: 'Carol White', role: 'Secretary', events: 15, engagement: 92 },
    { name: 'David Lee', role: 'Event Head', events: 18, engagement: 88 },
  ];

  const recentActivity = [
    { type: 'event', title: 'Annual Fest Team Meeting Completed', time: '1 hour ago' },
    { type: 'member', title: 'Alice Johnson joined organizing team', time: '2 hours ago' },
    { type: 'event', title: 'Tech Talk Speaker Confirmed', time: '4 hours ago' },
    { type: 'milestone', title: 'Membership reached 342 members', time: '1 day ago' },
    { type: 'event', title: 'Sports Championship Registration Opened', time: '2 days ago' },
  ];

  const statCards = [
    {
      title: 'Total Members',
      value: <AnimatedCounter from={0} to={stats.members} duration={2} />,
      change: 18,
      color: 'from-blue-600 to-cyan-500',
      icon: Users,
    },
    {
      title: 'Active Events',
      value: <AnimatedCounter from={0} to={stats.activeEvents} duration={2} />,
      change: 25,
      color: 'from-purple-600 to-pink-500',
      icon: Calendar,
    },
    {
      title: 'Participation Rate',
      value: <span className="text-3xl font-bold">{stats.participation}%</span>,
      change: 12,
      color: 'from-green-600 to-emerald-500',
      icon: TrendingUp,
    },
    {
      title: 'Engagement Score',
      value: <span className="text-3xl font-bold">{stats.engagement}</span>,
      change: 8,
      color: 'from-amber-500 to-orange-500',
      icon: Award,
    },
  ];

  const categoryColors = {
    Cultural: 'from-pink-600 to-rose-500',
    Learning: 'from-blue-600 to-cyan-500',
    Sports: 'from-green-600 to-emerald-500',
    Professional: 'from-purple-600 to-indigo-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
              <h1 className="text-4xl font-bold text-white mb-2">Guild Dashboard</h1>
              <p className="text-blue-200">Unity - Community - Excellence</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-blue-700/50 rounded-lg transition-colors duration-200"
              >
                <Bell className="w-6 h-6 text-blue-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-blue-700/50 rounded-lg transition-colors duration-200"
              >
                <Settings className="w-6 h-6 text-blue-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex gap-4 mb-8 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {['overview', 'events', 'members', 'analytics'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800/50 text-blue-200 hover:bg-slate-700/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Key Metrics */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-8 mb-8"
          >
            {/* Stats Grid */}
            <StatsGrid columns={4} cards={statCards} />

            {/* Upcoming Events and Team Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Events */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{event.name}</p>
                          <p className="text-xs text-blue-300 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {event.date}
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[event.category]} text-white`}>
                          {event.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-300">{event.participants} participants</p>
                        <span className={`text-xs font-semibold ${
                          event.status === 'In Progress' ? 'text-green-400' :
                          event.status === 'Scheduled' ? 'text-blue-400' :
                          'text-amber-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                variants={itemVariants}
                className="space-y-4"
              >
                <MetricCard
                  title="Member Growth"
                  metric="↑ 18%"
                  gradient="from-green-600 to-emerald-500"
                />
                <MetricCard
                  title="Event Success"
                  metric="92%"
                  gradient="from-blue-600 to-cyan-500"
                />
                <MetricCard
                  title="Team Collaboration"
                  metric="Excellent"
                  gradient="from-purple-600 to-pink-500"
                />
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm"
            >
              <h2 className="text-xl font-bold text-white mb-6">Guild Activity Feed</h2>
              <ActivityIndicator items={recentActivity} max={5} />
            </motion.div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Events</h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-blue-700/50 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5 text-blue-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Event
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 backdrop-blur-sm cursor-pointer transition-all duration-300"
                  onClick={() => setSelectedEvent(event.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>
                      <p className="text-sm text-blue-300 mb-2">{event.date}</p>
                      <p className="text-sm text-blue-300 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.participants} participants
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </motion.div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-blue-500/20">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Heart className="w-4 h-4" />
                      Manage
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-blue-300 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Team Members & Engagement</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memberEngagement.map((member, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-white">{member.name}</p>
                      <p className="text-sm text-blue-300">{member.role}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Award className="w-6 h-6 text-blue-500" />
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-300 mb-1">Events Participation: {member.events}</p>
                      <ProgressBar value={member.events * 6.7} max={100} color="blue" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-300 mb-1">Engagement Score: {member.engagement}%</p>
                      <ProgressBar value={member.engagement} max={100} color="cyan" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Member Growth</h3>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-400 mb-2">+65</p>
                <p className="text-sm text-blue-300">New members this month</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Event Attendance</h3>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-blue-400 mb-2">87%</p>
                <p className="text-sm text-blue-300">Average attendance rate</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Social Impact</h3>
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-3xl font-bold text-pink-400 mb-2">2.4K</p>
                <p className="text-sm text-blue-300">Reaches per event</p>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm"
            >
              <h3 className="font-bold text-white mb-4">Event Categories Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(categoryColors).map(([category, gradient], idx) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-300">{category}</p>
                      <p className="font-semibold text-white">{28 + idx * 5}%</p>
                    </div>
                    <ProgressBar value={28 + idx * 5} max={100} color="blue" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
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
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/50 transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>

      <Footer />
    </div>
  );
};

export default EnhancedGuildPresidentDashboard;
