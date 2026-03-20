import React, { useState, useEffect, useMemo } from "react";
import GlassCard from "../components/GlassCard";
import {
  Megaphone,
  MessageCircleWarning,
  AlertOctagon,
  TrendingUp,
  Eye,
  Clock,
  ArrowRight,
  Edit3,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import announcementService from "../../../../services/announcementService";

export default function Dashboard({ user: propUser }) {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = propUser || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getLecturerAnnouncements();
      if (response && response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to sync control center.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIONABLE DATA ENGINE
  // ==========================================
  const { metrics, attentionFeed, recentActivity } = useMemo(() => {
    if (!announcements.length) {
      return {
        metrics: { pendingComments: 0, criticalAlerts: 0, avgViews: 0 },
        attentionFeed: [],
        recentActivity: [],
      };
    }

    let pendingComments = 0;
    let criticalAlerts = 0;
    let totalViews = 0;
    const attentionItems = [];

    const now = new Date();

    announcements.forEach((ann) => {
      // 1. Calculate Views
      const views = ann.viewedBy?.length || 0;
      totalViews += views;

      // 2. Identify Pending Comments (Comments not made by the lecturer)
      const studentComments =
        ann.comments?.filter(
          (c) => c.user?._id !== user?.id && c.user !== user?.id,
        ) || [];

      pendingComments += studentComments.length;

      // 3. Risk Analysis for "Attention Feed" & Alerts
      const hoursSincePosted =
        (now - new Date(ann.createdAt)) / (1000 * 60 * 60);

      // Rule A: High confusion (Has student comments)
      if (studentComments.length > 0) {
        attentionItems.push({
          ...ann,
          issueType: "questions",
          issueText: `${studentComments.length} Unanswered Questions`,
          urgency: "yellow",
        });
      }

      // Rule B: Low Engagement Alert (Older than 24h, less than 5 views - adjust threshold as needed)
      if (hoursSincePosted > 24 && views < 5) {
        criticalAlerts += 1;
        // Don't duplicate in the feed if it's already there for questions
        if (!attentionItems.find((item) => item._id === ann._id)) {
          attentionItems.push({
            ...ann,
            issueType: "engagement",
            issueText: "Critical Low Read Rate",
            urgency: "red",
          });
        }
      }
    });

    return {
      metrics: {
        pendingComments,
        criticalAlerts,
        avgViews: Math.round(totalViews / announcements.length),
      },
      // Sort attention feed: Red alerts first, then Yellow
      attentionFeed: attentionItems
        .sort((a, b) => (a.urgency === "red" ? -1 : 1))
        .slice(0, 5),
      // Last 5 announcements for the audit trail
      recentActivity: announcements.slice(0, 5),
    };
  }, [announcements, user]);

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Control Center
          </h1>
          <p className="text-neutral-400">
            Actionable insights and urgent alerts for your classes.
          </p>
        </div>
        <Link
          to="/lecturer/create"
          className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center gap-2 active:scale-95"
        >
          <Megaphone size={18} /> Broadcast Urgent Notice
        </Link>
      </header>

      {/* TOP ROW: TRIAGE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Metric 1: Questions */}
        <div
          className={`p-5 rounded-2xl border transition-all ${metrics.pendingComments > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-white/[0.02] border-white/5"}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-2.5 rounded-lg ${metrics.pendingComments > 0 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-neutral-400"}`}
            >
              <MessageCircleWarning size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-1">
            {loading ? "-" : metrics.pendingComments}
          </h3>
          <p className="text-sm font-medium text-neutral-400">
            Unanswered Questions
          </p>
        </div>

        {/* Metric 2: Alerts */}
        <div
          className={`p-5 rounded-2xl border transition-all ${metrics.criticalAlerts > 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/[0.02] border-white/5"}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-2.5 rounded-lg ${metrics.criticalAlerts > 0 ? "bg-red-500/20 text-red-500" : "bg-white/5 text-neutral-400"}`}
            >
              <AlertOctagon size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-1">
            {loading ? "-" : metrics.criticalAlerts}
          </h3>
          <p className="text-sm font-medium text-neutral-400">
            Low Engagement Alerts
          </p>
        </div>

        {/* Metric 3: Health */}
        <div className="p-5 rounded-2xl border bg-white/[0.02] border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-1">
            {loading ? "-" : `${metrics.avgViews} avg`}
          </h3>
          <p className="text-sm font-medium text-neutral-400">
            Global Read Volume
          </p>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN: REQUIRES ATTENTION (60%) */}
        <GlassCard
          delay={0.2}
          className="lg:col-span-3 flex flex-col min-h-[400px]"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon size={18} className="text-red-400" /> Requires
                Attention
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Issues that need your immediate resolution.
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-4 pt-4 text-center text-neutral-500">
                Scanning classes...
              </div>
            ) : attentionFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500" size={28} />
                </div>
                <p className="text-lg font-bold text-white mb-1">All Clear</p>
                <p className="text-sm text-neutral-400">
                  No urgent issues or unanswered questions detected.
                </p>
              </div>
            ) : (
              attentionFeed.map((item) => (
                <div
                  key={item._id}
                  className="group bg-[#1A1A1A] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.urgency === "red" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}
                      >
                        {item.issueText}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {item.course?.code}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {item.viewedBy?.length || 0} views
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/lecturer/announcements")} // Ideally, link directly to open the Drawer for this ID
                    className="shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                  >
                    Resolve <ArrowRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* RIGHT COLUMN: RECENT BROADCASTS (40%) */}
        <GlassCard delay={0.3} className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">Audit Trail</h3>
            <Link
              to="/lecturer/announcements"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage All
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="animate-pulse space-y-4 pt-4 text-center text-neutral-500">
                Loading history...
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">
                No broadcasts sent yet.
              </p>
            ) : (
              recentActivity.map((ann) => (
                <div
                  key={ann._id}
                  className="p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-white line-clamp-1 flex-1 pr-2">
                      {ann.title}
                    </p>
                    <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate("/lecturer/announcements")}
                        className="text-neutral-400 hover:text-blue-400"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-400">
                      {ann.course?.code || "GEN"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye
                          size={12}
                          className={
                            ann.viewedBy?.length > 0 ? "text-emerald-500" : ""
                          }
                        />{" "}
                        {ann.viewedBy?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircleWarning
                          size={12}
                          className={
                            ann.comments?.length > 0 ? "text-amber-500" : ""
                          }
                        />{" "}
                        {ann.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
