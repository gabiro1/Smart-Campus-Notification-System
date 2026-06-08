import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, ShieldCheck, UserCheck,
  Activity, Calendar, ArrowRight, Megaphone,
  Bell, MessageSquare, Settings, Loader2, AlertCircle,
  FileText, RefreshCw, ChevronRight
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import leadershipService from "../../../../services/studentLeadershipService";

function ErrorState({ onRetry }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-lg font-semibold text-foreground">Failed to Load Dashboard</p>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Unable to fetch guild data. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </GlassCard>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionLink, navigate }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
      {actionLabel && actionLink && (
        <button
          onClick={() => navigate(actionLink)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm mt-2"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </GlassCard>
  );
}

const QUICK_ACTIONS = [
  { label: "Review Events", icon: ShieldCheck, path: "/guild/events", color: "from-blue-600 to-blue-700", desc: "Moderate pending events" },
  { label: "Publish Event", icon: Calendar, path: "/guild/events/publish", color: "from-emerald-600 to-emerald-700", desc: "Create & publish directly" },
  { label: "Propose Class Rep", icon: UserCheck, path: "/guild/class-reps", color: "from-purple-600 to-purple-700", desc: "Nominate new class rep" },
  { label: "Post Announcement", icon: Megaphone, path: "/guild/post-events", color: "from-amber-600 to-amber-700", desc: "Share guild updates" },
];

export default function GuildOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [council, setCouncil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsRes, councilRes] = await Promise.all([
        leadershipService.getStats(),
        leadershipService.getActiveCouncil().catch(() => null),
      ]);
      setStats(statsRes?.data || statsRes);
      setCouncil(councilRes?.data || councilRes);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingCard className="lg:col-span-2 h-64" />
          <LoadingCard className="h-64" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState onRetry={fetchData} />;

  const statCards = [
    { title: "Council Members", value: council?.positions?.length || stats?.activeCouncil?.positions?.length || 0, icon: Users, iconBgClass: "bg-blue-500/10", iconClass: "text-blue-500" },
    { title: "Class Reps", value: stats?.activeClassReps ?? stats?.classReps?.active ?? 0, icon: UserCheck, iconBgClass: "bg-emerald-500/10", iconClass: "text-emerald-500" },
    { title: "Pending Proposals", value: stats?.pendingClassReps ?? stats?.classReps?.pending ?? 0, icon: FileText, iconBgClass: "bg-amber-500/10", iconClass: "text-amber-500" },
    { title: "Event Queue", value: stats?.pendingEvents ?? 0, icon: Activity, iconBgClass: "bg-purple-500/10", iconClass: "text-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Guild President Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage guild activities, moderate events, and oversee council operations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {QUICK_ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, ease: "easeOut" }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${action.color} text-white text-left group`}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <action.icon className="w-6 h-6 mb-3 opacity-90" />
            <h3 className="text-base font-semibold mb-1">{action.label}</h3>
            <p className="text-xs text-white/70">{action.desc}</p>
            <ChevronRight size={16} className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Active Guild Council</h2>
            {council?.positions?.length > 0 && (
              <span className="text-xs text-muted-foreground bg-accent px-2.5 py-1 rounded-full border border-border">
                {council.academicYear || "Current Year"}
              </span>
            )}
          </div>
          {!council || !council.positions?.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Users className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No active council members</p>
            </div>
          ) : (
            <div className="space-y-3">
              {council.positions.map((pos, i) => (
                <motion.div
                  key={pos._id || i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-accent/50 border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {pos.userId?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {pos.userId?.name || "Unfilled"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{pos.title}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Active
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Quick Info</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-3">
                <UserCheck size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Active Class Reps</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{stats?.activeClassReps ?? stats?.classReps?.active ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Pending Proposals</span>
              </div>
              <span className="text-sm font-bold text-amber-400">{stats?.pendingClassReps ?? stats?.classReps?.pending ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Pending Elections</span>
              </div>
              <span className="text-sm font-bold text-blue-400">{stats?.pendingCouncilElections ?? stats?.pendingElections ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Council Positions</span>
              </div>
              <span className="text-sm font-bold text-purple-400">{council?.positions?.length || 0}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
