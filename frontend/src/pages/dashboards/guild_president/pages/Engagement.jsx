import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, Calendar, Users, Eye, ThumbsUp, MessageSquare,
  Loader2, AlertCircle, RefreshCw, TrendingUp, TrendingDown,
  BarChart3, Clock, CheckCircle, XCircle
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import eventService from "../../../../services/eventService";

function ErrorState({ onRetry }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-lg font-semibold text-foreground">Failed to Load Engagement Data</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
        <RefreshCw size={16} /> Retry
      </button>
    </GlassCard>
  );
}

function EmptyState() {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        <Activity className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold text-foreground">No Engagement Data</p>
      <p className="text-sm text-muted-foreground">Start publishing events to see engagement metrics.</p>
    </GlassCard>
  );
}

export default function GuildEngagement() {
  const [analytics, setAnalytics] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [analyticsRes, queueRes] = await Promise.all([
        eventService.getDashboardAnalytics?.() || eventService.getReviewQueueByStatus?.(),
        eventService.getReviewQueue?.(),
      ].map(p => p?.catch(() => null)));
      setAnalytics(analyticsRes?.data || analyticsRes);
      setQueue(queueRes?.data || queueRes);
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
        <div className="mb-6">
          <div className="h-8 w-56 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-80 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <LoadingCard className="h-72" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={fetchData} />;

  const eventData = analytics?.events || analytics?.byStatus || {};
  const totalPublished = eventData?.PUBLISHED || eventData?.published || 0;
  const totalPending = eventData?.PENDING_REVIEW || eventData?.pending || 0;
  const totalRejected = eventData?.REJECTED || eventData?.rejected || 0;
  const totalEvents = totalPublished + totalPending + totalRejected + (eventData?.APPROVED || 0) + (eventData?.DRAFT || 0);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Engagement</h1>
        <p className="text-muted-foreground mt-1">Track event engagement and student activity metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Events" value={totalEvents} icon={Calendar} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Published" value={totalPublished} icon={CheckCircle} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
        <StatCard title="Pending Review" value={totalPending} icon={Clock} iconBgClass="bg-amber-500/10" iconClass="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold text-foreground mb-4">Event Status Distribution</h2>
          <div className="space-y-4">
            {[
              { label: "Draft", value: eventData?.DRAFT || 0, color: "bg-muted", textColor: "text-muted-foreground" },
              { label: "Pending Review", value: totalPending, color: "bg-amber-500", textColor: "text-amber-400" },
              { label: "Approved", value: eventData?.APPROVED || 0, color: "bg-blue-500", textColor: "text-blue-400" },
              { label: "Published", value: totalPublished, color: "bg-emerald-500", textColor: "text-emerald-400" },
              { label: "Rejected", value: totalRejected, color: "bg-red-500", textColor: "text-red-400" },
            ].filter(s => s.value > 0).map((s) => {
              const pct = totalEvents > 0 ? Math.round((s.value / totalEvents) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className={`font-medium ${s.textColor}`}>{s.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${s.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-foreground mb-4">Activity Overview</h2>
          <div className="space-y-3">
            {[
              { icon: BarChart3, label: "Review Queue Items", value: queue?.length || 0, color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Eye, label: "Events in Review", value: Array.isArray(queue) ? queue.filter(e => e.status === 'UNDER_REVIEW').length : 0, color: "text-purple-400", bg: "bg-purple-500/10" },
              { icon: TrendingUp, label: "Publication Rate", value: totalEvents > 0 ? `${Math.round((totalPublished / totalEvents) * 100)}%` : "0%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: TrendingDown, label: "Rejection Rate", value: totalEvents > 0 ? `${Math.round((totalRejected / totalEvents) * 100)}%` : "0%", color: "text-red-400", bg: "bg-red-500/10" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.bg}`}>
                  <item.icon size={16} className={item.color} />
                </div>
                <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
