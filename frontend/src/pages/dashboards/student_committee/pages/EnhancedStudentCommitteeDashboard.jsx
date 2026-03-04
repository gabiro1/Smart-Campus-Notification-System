import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BarChart3, CheckCircle2, AlertCircle,
  ClipboardList, MessageSquare, Target, Zap,
  Plus, Filter, Download, Bell, Settings,
  Lightbulb, Megaphone, Clock, TrendingUp
} from 'lucide-react';
import DashboardCard from '../../../../components/dashboards/DashboardCard';
import AnimatedCounter from '../../../../components/dashboards/AnimatedCounter';
import StatsGrid from '../../../../components/dashboards/StatsGrid';
import { MetricCard, ProgressBar, DataPoint, ActivityIndicator } 
  from '../../../../components/dashboards/DataViz';
import Navbar from '../../../../layouts/Navbar';
import Footer from '../../../../layouts/Footer';

const EnhancedStudentCommitteeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState(null);

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
    proposals: 24,
    implemented: 18,
    impact: 2847,
    satisfaction: 8.7
  };

  const activeTasks = [
    { 
      id: 1, 
      title: 'Campus WiFi Enhancement Proposal', 
      status: 'In Review',
      priority: 'High',
      progress: 65,
      votes: 156
    },
    { 
      id: 2, 
      title: 'Library Extension Timing Survey', 
      status: 'Ongoing',
      priority: 'Medium',
      progress: 32,
      votes: 89
    },
    { 
      id: 3, 
      title: 'Student Counseling Services Improvement', 
      status: 'Implemented',
      priority: 'High',
      progress: 100,
      votes: 201
    },
    { 
      id: 4, 
      title: 'Campus Digital Display System', 
      status: 'Planning',
      priority: 'Medium',
      progress: 15,
      votes: 67
    },
  ];

  const committeMembers = [
    { name: 'Priya Sharma', role: 'Secretary', tasks: 8, contribution: 95 },
    { name: 'Arjun Patel', role: 'Finance Head', tasks: 6, contribution: 88 },
    { name: 'Neha Gupta', role: 'Communications', tasks: 10, contribution: 92 },
    { name: 'Rohan Singh', role: 'Events Coordinator', tasks: 7, contribution: 87 },
  ];

  const completedProposals = [
    { title: 'Campus Parking Improvement', votes: 234, impact: 'Positive', implementation: 'Dec 2024' },
    { title: 'Online Course Options Expansion', votes: 198, impact: 'Very Positive', implementation: 'Nov 2024' },
    { title: 'Dining Hall Menu Feedback System', votes: 167, impact: 'Positive', implementation: 'Oct 2024' },
  ];

  const recentActivity = [
    { type: 'vote', title: 'Campus WiFi Enhancement - New vote cast', time: '30 mins ago' },
    { type: 'task', title: 'Library Survey - 150 responses collected', time: '2 hours ago' },
    { type: 'proposal', title: 'Digital Display System - Proposal submitted', time: '5 hours ago' },
    { type: 'milestone', title: 'Counseling Services - Successfully implemented', time: '1 day ago' },
    { type: 'task', title: 'Committee Meeting - 18 attendees present', time: '2 days ago' },
  ];

  const statCards = [
    {
      title: 'Active Proposals',
      value: <AnimatedCounter from={0} to={stats.proposals} duration={2} />,
      change: 8,
      color: 'from-emerald-600 to-teal-500',
      icon: ClipboardList,
    },
    {
      title: 'Successfully Implemented',
      value: <AnimatedCounter from={0} to={stats.implemented} duration={2} />,
      change: 12,
      color: 'from-green-600 to-emerald-500',
      icon: CheckCircle2,
    },
    {
      title: 'Students Impacted',
      value: <AnimatedCounter from={0} to={stats.impact} duration={2} />,
      change: 34,
      color: 'from-cyan-600 to-blue-500',
      icon: Users,
    },
    {
      title: 'Satisfaction Score',
      value: <span className="text-3xl font-bold">{stats.satisfaction}</span>,
      change: 7,
      color: 'from-purple-600 to-pink-500',
      icon: TrendingUp,
    },
  ];

  const statusColors = {
    'In Review': 'from-yellow-600 to-amber-500',
    'Ongoing': 'from-blue-600 to-cyan-500',
    'Implemented': 'from-green-600 to-emerald-500',
    'Planning': 'from-purple-600 to-indigo-500',
  };

  const priorityColors = {
    'High': 'text-red-400',
    'Medium': 'text-amber-400',
    'Low': 'text-green-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
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
              <h1 className="text-4xl font-bold text-white mb-2">Student Committee</h1>
              <p className="text-emerald-200">Your Voice, Our Priority</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors duration-200"
              >
                <Bell className="w-6 h-6 text-emerald-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors duration-200"
              >
                <Settings className="w-6 h-6 text-emerald-300" />
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
          {['overview', 'proposals', 'committee', 'impact'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800/50 text-emerald-200 hover:bg-slate-700/50'
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

            {/* Active Proposals and Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Proposals */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Active Proposals</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {activeTasks.slice(0, 3).map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{task.title}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${statusColors[task.status]} text-white`}>
                              {task.status}
                            </span>
                            <span className={`text-xs font-semibold ${priorityColors[task.priority]}`}>
                              {task.priority} Priority
                            </span>
                          </div>
                        </div>
                        <p className="text-right">
                          <p className="font-semibold text-emerald-300">{task.votes}</p>
                          <p className="text-xs text-emerald-400">votes</p>
                        </p>
                      </div>
                      <ProgressBar value={task.progress} max={100} color="emerald" />
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
                  title="Implementation Rate"
                  metric="75%"
                  gradient="from-green-600 to-emerald-500"
                />
                <MetricCard
                  title="Avg Votes/Proposal"
                  metric="156"
                  gradient="from-cyan-600 to-blue-500"
                />
                <MetricCard
                  title="Committee Efficiency"
                  metric="A+"
                  gradient="from-purple-600 to-pink-500"
                />
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm"
            >
              <h2 className="text-xl font-bold text-white mb-6">Committee Activity</h2>
              <ActivityIndicator items={recentActivity} max={5} />
            </motion.div>
          </motion.div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Proposals</h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5 text-emerald-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Proposal
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {activeTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  whileHover={{ x: 8 }}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-sm cursor-pointer transition-all duration-300"
                  onClick={() => setSelectedTask(task.id)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                      <div className="flex gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${statusColors[task.status]} text-white`}>
                          {task.status}
                        </span>
                        <span className={`text-xs font-semibold ${priorityColors[task.priority]}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-300 mb-2">Progress</p>
                      <ProgressBar value={task.progress} max={100} color="emerald" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-emerald-300">Votes</p>
                      <p className="text-3xl font-bold text-emerald-400">{task.votes}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Completed Proposals Section */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm mt-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Recently Implemented</h3>
              <div className="space-y-3">
                {completedProposals.map((proposal, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700/50 rounded-lg p-4 border border-green-500/20 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        {proposal.title}
                      </p>
                      <p className="text-sm text-emerald-300 mt-1">{proposal.votes} votes • {proposal.impact} impact</p>
                    </div>
                    <p className="text-right">
                      <p className="text-sm text-emerald-300">{proposal.implementation}</p>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Committee Tab */}
        {activeTab === 'committee' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Committee Members</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {committeMembers.map((member, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-white">{member.name}</p>
                      <p className="text-sm text-emerald-300">{member.role}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Target className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-emerald-300 mb-1">Tasks Completed: {member.tasks}</p>
                      <ProgressBar value={member.tasks * 12.5} max={100} color="emerald" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-300 mb-1">Contribution Score: {member.contribution}%</p>
                      <ProgressBar value={member.contribution} max={100} color="teal" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Impact & Outcomes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Student Engagement</h3>
                  <Megaphone className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-emerald-400 mb-2">3.2K</p>
                <p className="text-sm text-emerald-300">Active participants</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Successful Changes</h3>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-400 mb-2">18</p>
                <p className="text-sm text-emerald-300">Implemented proposals</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Innovation Index</h3>
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-3xl font-bold text-amber-400 mb-2">9.2/10</p>
                <p className="text-sm text-emerald-300">Innovation score</p>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm"
            >
              <h3 className="font-bold text-white mb-6">Impact Categories</h3>
              <div className="space-y-4">
                {[
                  { category: 'Campus Infrastructure', impact: 85 },
                  { category: 'Student Welfare', impact: 92 },
                  { category: 'Academic Experience', impact: 78 },
                  { category: 'Digital Services', impact: 88 },
                  { category: 'Community Building', impact: 95 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-emerald-300">{item.category}</p>
                      <p className="font-semibold text-white">{item.impact}%</p>
                    </div>
                    <ProgressBar value={item.impact} max={100} color="emerald" />
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
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:shadow-emerald-500/50 transition-shadow"
        >
          <Lightbulb className="w-6 h-6" />
        </motion.button>
      </motion.div>

      <Footer />
    </div>
  );
};

export default EnhancedStudentCommitteeDashboard;
