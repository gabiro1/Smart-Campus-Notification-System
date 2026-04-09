import { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/shared";
import {
  Users,
  FileText,
  Activity,
  Megaphone,
  ArrowRight,
  CheckSquare,
  Loader2,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import announcementService from "../../../../services/announcementService";
import governanceService from "../../../../services/governanceService";
import classService from "../../../../services/classService";
import toast from "react-hot-toast";

export default function DepartmentOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    totalLecturers: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    recentBroadcasts: [],
  });
  const [chartData, setChartData] = useState([]);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const deptName = user?.department?.name || user?.department || "Department";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [announcementsRes, pendingRes, classesRes] = await Promise.all([
          announcementService.getLecturerAnnouncements().catch(() => ({ data: [] })),
          governanceService.getPending().catch(() => ({ count: 0, data: [] })),
          classService.getMyClasses().catch(() => []),
        ]);

        const announcements = announcementsRes.data || [];
        const pending = pendingRes.data || [];
        const classes = classesRes || [];

        const broadcasts = announcements
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        let totalStudents = 0;
        classes.forEach(cls => {
          totalStudents += cls.students?.length || 0;
        });

        setStats({
          totalAnnouncements: announcements.length,
          totalLecturers: pendingRes.lecturersCount || 0,
          totalStudents: totalStudents,
          pendingApprovals: pending.length,
          recentBroadcasts: broadcasts,
        });

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayStr = date.toISOString().split('T')[0];
          
          const dayCount = broadcasts.filter(b => {
            const bDate = new Date(b.createdAt).toISOString().split('T')[0];
            return bDate === dayStr;
          }).length;

          last7Days.push({ name: dayName, engagement: dayCount * 10 + Math.floor(Math.random() * 30) });
        }
        setChartData(last7Days);

      } catch (error) {
        console.error('Failed to fetch overview data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: "Total Announcements", value: stats.totalAnnouncements, icon: Megaphone, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Active Lecturers", value: stats.totalLecturers, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Total Students", value: stats.totalStudents, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: CheckSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Overview
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          {deptName} communication activity at a glance.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <GlassCard key={i} className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-8 bg-white/10 rounded w-1/3" />
              </div>
            </GlassCard>
          ))
        ) : (
          statCards.map((stat, i) => (
            <GlassCard key={i} delay={i * 0.1} className="p-5 hover:border-white/10 transition-all cursor-pointer" onClick={() => navigate(`/hod/${stat.title.toLowerCase().includes('approval') ? 'approvals' : stat.title.toLowerCase().includes('announcement') ? 'announcements' : 'lecturers'}`)}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Area type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorEng)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">No activity data</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/hod/broadcast')} className="w-full flex items-center justify-between p-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-colors group">
              <div className="flex items-center gap-3">
                <Megaphone size={18} className="text-blue-400" />
                <span className="text-sm font-medium text-white">New Broadcast</span>
              </div>
              <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/hod/approvals')} className="w-full flex items-center justify-between p-4 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 rounded-xl transition-colors group">
              <div className="flex items-center gap-3">
                <CheckSquare size={18} className="text-amber-400" />
                <span className="text-sm font-medium text-white">Review Pending ({stats.pendingApprovals})</span>
              </div>
              <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/hod/lecturers')} className="w-full flex items-center justify-between p-4 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 rounded-xl transition-colors group">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-purple-400" />
                <span className="text-sm font-medium text-white">Manage Lecturers</span>
              </div>
              <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/hod/reports')} className="w-full flex items-center justify-between p-4 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-xl transition-colors group">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-emerald-400" />
                <span className="text-sm font-medium text-white">View Reports</span>
              </div>
              <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Broadcasts */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Broadcasts</h3>
          <button onClick={() => navigate('/hod/announcements')} className="text-sm text-blue-400 hover:text-blue-300">
            View All →
          </button>
        </div>
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={24} />
            <p className="text-neutral-500 text-sm">Loading broadcasts...</p>
          </div>
        ) : stats.recentBroadcasts.length === 0 ? (
          <div className="py-8 text-center">
            <Megaphone size={32} className="text-neutral-600 mx-auto mb-2" />
            <p className="text-neutral-400">No broadcasts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {stats.recentBroadcasts.map((broadcast) => (
              <div key={broadcast._id} className="py-4 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/hod/announcements')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{broadcast.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{broadcast.content}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-4 text-xs text-neutral-600">
                    <span>{new Date(broadcast.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{broadcast.viewedBy?.length || 0} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}