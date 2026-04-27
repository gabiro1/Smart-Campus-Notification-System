import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Loader2, Send, Eye, MessageSquare, BookOpen, Clock, 
  Plus, TrendingUp, ArrowRight, Bell, Megaphone, Users, BarChart3
} from "lucide-react";
import UrgentAlertModal from "../components/UrgentAlertModal";
import toast from "react-hot-toast";
import announcementService from "../../../../services/announcementService";
import classService from "../../../../services/classService";

export default function Dashboard({ user: propUser }) {
  const navigate = useNavigate();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  const [stats, setStats] = useState({ totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const user = propUser || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, announcementsRes, classesRes] = await Promise.all([
          announcementService.getDashboardStats().catch(() => ({ data: { totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 } })),
          announcementService.getLecturerAnnouncements().catch(() => ({ data: [] })),
          classService.getMyClasses().catch(() => [])
        ]);
        
        setStats(statsRes?.data || { totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 });
        setClasses(classesRes || []);
        
        const sorted = (announcementsRes?.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentAnnouncements(sorted.slice(0, 4));
        
      } catch (error) {
        toast.error("Failed to sync dashboard from database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Announcements", value: stats.totalSent, icon: Megaphone, color: "from-blue-500 to-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "from-purple-500 to-purple-600", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Active Courses", value: stats.activeCourses, icon: BookOpen, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Classes", value: classes.length, icon: Users, color: "from-amber-500 to-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Lecturer'}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Here's what's happening with your announcements today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/lecturer/analytics')}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-foreground transition-all"
          >
            <BarChart3 size={16} />
            View Analytics
          </button>
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-foreground rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
          >
            <AlertTriangle size={16} />
            Quick Alert
          </button>
        </div>
      </header>

      {/* Stats Grid - Clean Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-[#0F1117] to-[#161B22] border border-border rounded-2xl p-5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={18} className={`text-${stat.color.split(' ')[0].replace('from-', '')}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 className="animate-spin" size={20} /> : stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Recent Announcements</h2>
            <button 
              onClick={() => navigate('/lecturer/announcements')}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 mb-3" size={28} />
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-3">
                  <Megaphone size={24} className="text-neutral-600" />
                </div>
                <p className="text-muted-foreground font-medium">No announcements yet</p>
                <button 
                  onClick={() => navigate('/lecturer/create')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-foreground text-sm font-medium rounded-lg transition-colors"
                >
                  Create First Announcement
                </button>
              </div>
            ) : (
              recentAnnouncements.map((ann, index) => (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => navigate('/lecturer/announcements')}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">{ann.title}</h3>
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      ann.type === 'Urgent' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-accent text-muted-foreground border border-white/10'
                    }`}>
                      {ann.type || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ann.content}</p>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-600">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} /> {ann.course?.code || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {ann.viewedBy?.length || 0} views
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Classes */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/lecturer/create')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 text-sm font-medium transition-all group"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                New Announcement
              </button>
              <button 
                onClick={() => navigate('/lecturer/classes')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent hover:bg-white/10 border border-white/10 text-neutral-300 text-sm font-medium transition-all group"
              >
                <Users size={18} className="group-hover:scale-110 transition-transform" />
                Manage Classes
              </button>
              <button 
                onClick={() => navigate('/lecturer/governance')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent hover:bg-white/10 border border-white/10 text-neutral-300 text-sm font-medium transition-all group"
              >
                <Send size={18} className="group-hover:scale-110 transition-transform" />
                Governance
              </button>
            </div>
          </div>

          {/* Your Classes */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Your Classes</h2>
              <button 
                onClick={() => navigate('/lecturer/classes')}
                className="text-xs text-muted-foreground hover:text-neutral-300"
              >
                See all
              </button>
            </div>
            <div className="p-4 space-y-2">
              {classes.slice(0, 3).map((cls) => (
                <div 
                  key={cls._id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-accent hover:bg-white/10 border border-border cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BookOpen size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cls.code}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{cls.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{cls.studentCount || 0}</span>
                </div>
              ))}
              {classes.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No classes assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <UrgentAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} />
    </div>
  );
}