import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2, Send, Eye, MessageSquare, BookOpen, Clock } from "lucide-react";
import UrgentAlertModal from "../components/UrgentAlertModal";
import toast from "react-hot-toast";

// Services
import announcementService from "../../../../services/announcementService";

export default function Dashboard({ user: propUser }) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  // Database States
  const [stats, setStats] = useState({ totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const user = propUser || JSON.parse(localStorage.getItem("user"));

  // Fetch Stats & Feed on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fire both API requests simultaneously
        const [statsRes, announcementsRes] = await Promise.all([
          announcementService.getDashboardStats().catch(() => ({ data: { totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 } })),
          announcementService.getLecturerAnnouncements().catch(() => ({ data: [] }))
        ]);
        
        setStats(statsRes?.data || { totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 });
        
        // Take top 5 most recent announcements for the dashboard feed
        const sorted = (announcementsRes?.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentAnnouncements(sorted.slice(0, 5));
        
      } catch (error) {
        toast.error("Failed to sync dashboard from database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      
      {/* HEADER & URGENT DISPATCH */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
            Overview
          </h1>
          <p className="text-neutral-400 font-medium">
            Welcome back, {user?.name || "Lecturer"}. Here is your communication snapshot.
          </p>
        </div>
        
        {/* The Big Red Button */}
        <button
          onClick={() => setIsAlertModalOpen(true)}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-3 active:scale-[0.98] border border-red-500 hover:border-red-400"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          URGENT DISPATCH
        </button>
      </header>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-input border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 hover:bg-[rgba(30,35,45,0.8)] hover:border-[#3A3F4D] hover:shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all group">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-blue-500/10 text-muted-foreground group-hover:text-blue-400 transition-colors"><Send size={18} /></div>
               <p className="text-muted-foreground group-hover:text-slate-300 font-bold text-sm transition-colors">Total Sent</p>
            </div>
            <p className="text-3xl font-black text-white ml-1 group-hover:translate-x-1 transition-transform">
              {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground mt-2" /> : stats.totalSent}
            </p>
         </div>
         <div className="bg-input border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 hover:bg-[rgba(30,35,45,0.8)] hover:border-[#3A3F4D] hover:shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all group">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-blue-500/10 text-muted-foreground group-hover:text-blue-400 transition-colors"><Eye size={18} /></div>
               <p className="text-muted-foreground group-hover:text-slate-300 font-bold text-sm transition-colors">Total Views</p>
            </div>
            <p className="text-3xl font-black text-white ml-1 group-hover:translate-x-1 transition-transform">
              {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground mt-2" /> : stats.totalViews}
            </p>
         </div>
         <div className="bg-input border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 hover:bg-[rgba(30,35,45,0.8)] hover:border-[#3A3F4D] hover:shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all group">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-blue-500/10 text-muted-foreground group-hover:text-blue-400 transition-colors"><MessageSquare size={18} /></div>
               <p className="text-muted-foreground group-hover:text-slate-300 font-bold text-sm transition-colors">Total Comments</p>
            </div>
            <p className="text-3xl font-black text-white ml-1 group-hover:translate-x-1 transition-transform">
              {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground mt-2" /> : stats.totalComments}
            </p>
         </div>
         <div className="bg-input border border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 hover:bg-[rgba(30,35,45,0.8)] hover:border-[#3A3F4D] hover:shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all group">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-blue-500/10 text-muted-foreground group-hover:text-blue-400 transition-colors"><BookOpen size={18} /></div>
               <p className="text-muted-foreground group-hover:text-slate-300 font-bold text-sm transition-colors">Active Courses</p>
            </div>
            <p className="text-3xl font-black text-white ml-1 group-hover:translate-x-1 transition-transform">
              {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground mt-2" /> : stats.activeCourses}
            </p>
         </div>
      </div>

      {/* FEED & ACTIVITY */}
      <div className="bg-input border border-border rounded-3xl overflow-hidden mt-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        <div className="px-8 py-6 border-b border-border">
          <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
            Recent Announcements
          </h2>
        </div>
        
        <div className="divide-y divide-[#2A2E39]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="text-muted-foreground font-medium text-sm">Loading recent activity...</p>
            </div>
          ) : recentAnnouncements.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground font-medium">You haven't posted any announcements yet.</p>
            </div>
          ) : (
            recentAnnouncements.map((ann) => (
              <div key={ann._id} className="p-8 hover:bg-[rgba(30,35,45,0.5)] transition-colors group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-[17px] font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                    {ann.title}
                  </h3>
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg ${ann.type === 'Urgent' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-muted text-muted-foreground border border-[#3A3F4D]'}`}>
                    {ann.type || "General"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
                  {ann.content}
                </p>
                <div className="flex items-center gap-6 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-muted-foreground"/> {ann.course?.code || "No Course"}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-muted-foreground"/> {new Date(ann.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Eye size={14} className="text-muted-foreground"/> {ann.viewedBy?.length || 0} read</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL MOUNT */}
      <UrgentAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
      />
      
    </div>
  );
}
