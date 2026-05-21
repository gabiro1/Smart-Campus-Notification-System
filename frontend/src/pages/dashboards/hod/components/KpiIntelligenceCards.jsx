/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Gauge,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/shared/cards/StatCard";

function TrendIndicator({ current, previous, label }) {
  const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  const isPositive = change >= 0;

  if (previous === 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${
      isPositive ? "text-emerald-400" : "text-rose-400"
    }`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(change)}% vs {label}
    </span>
  );
}

function ContextualInsight({ kpiKey, value }) {
  const insights = {
    engagementRate: {
      low: "Engagement needs attention. Consider targeted broadcasts.",
      medium: "Steady engagement. Room for improvement.",
      high: "Strong engagement. Department communication is effective.",
    },
    workloadPressure: {
      low: "Comfortable workload distribution.",
      medium: "Moderate workload. Monitor lecturer capacity.",
      high: "High workload pressure. Consider redistributing tasks.",
    },
  };

  const config = insights[kpiKey];
  if (!config) return null;

  let level;
  if (value < 30) level = "low";
  else if (value < 70) level = "medium";
  else level = "high";

  return (
    <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">
      {config[level]}
    </p>
  );
}

export default function KpiIntelligenceCards({ kpis, loading }) {
  const navigate = useNavigate();

  const cards = [
    {
      key: "engagementRate",
      title: "Engagement Rate",
      value: `${kpis?.engagementRate ?? 0}%`,
      icon: Activity,
      trend: kpis?.previousEngagementRate > 0
        ? `${kpis.engagementRate >= kpis.previousEngagementRate ? "+" : ""}${kpis.engagementRate - kpis.previousEngagementRate}%`
        : undefined,
      isPositive: (kpis?.engagementRate ?? 0) >= (kpis?.previousEngagementRate ?? 0),
      previous: kpis?.previousEngagementRate,
      baselineText: "last week",
      iconBgClass: kpis?.engagementRate >= 50 ? "bg-emerald-500/10" : kpis?.engagementRate >= 25 ? "bg-amber-500/10" : "bg-rose-500/10",
      iconClass: kpis?.engagementRate >= 50 ? "text-emerald-400" : kpis?.engagementRate >= 25 ? "text-amber-400" : "text-rose-400",
      navPath: "/hod/reports",
    },
    {
      key: "activeLecturers",
      title: "Active Lecturers",
      value: kpis?.activeLecturers ?? 0,
      icon: Users,
      trend: kpis?.previousActiveLecturers > 0
        ? `${kpis.activeLecturers >= kpis.previousActiveLecturers ? "+" : ""}${kpis.activeLecturers - kpis.previousActiveLecturers}`
        : undefined,
      isPositive: (kpis?.activeLecturers ?? 0) >= (kpis?.previousActiveLecturers ?? 0),
      previous: kpis?.previousActiveLecturers,
      baselineText: "last week",
      iconBgClass: "bg-blue-500/10",
      iconClass: "text-blue-400",
      navPath: "/hod/lecturers",
    },
    {
      key: "studentParticipation",
      title: "Student Participation",
      value: `${kpis?.studentParticipation ?? 0}%`,
      icon: Eye,
      trend: kpis?.previousParticipation > 0
        ? `${kpis.studentParticipation >= kpis.previousParticipation ? "+" : ""}${kpis.studentParticipation - kpis.previousParticipation}%`
        : undefined,
      isPositive: (kpis?.studentParticipation ?? 0) >= (kpis?.previousParticipation ?? 0),
      previous: kpis?.previousParticipation,
      baselineText: "last week",
      iconBgClass: "bg-purple-500/10",
      iconClass: "text-purple-400",
      navPath: "/hod/reports",
    },
    {
      key: "workloadPressure",
      title: "Workload Pressure",
      value: `${kpis?.workloadPressure ?? 0}%`,
      icon: Gauge,
      trend: kpis?.previousWorkload > 0
        ? `${kpis.workloadPressure >= kpis.previousWorkload ? "+" : ""}${kpis.workloadPressure - kpis.previousWorkload}%`
        : undefined,
      isPositive: (kpis?.workloadPressure ?? 0) <= (kpis?.previousWorkload ?? 0),
      previous: kpis?.previousWorkload,
      baselineText: "last week",
      iconBgClass: kpis?.workloadPressure >= 70 ? "bg-rose-500/10" : kpis?.workloadPressure >= 40 ? "bg-amber-500/10" : "bg-emerald-500/10",
      iconClass: kpis?.workloadPressure >= 70 ? "text-rose-400" : kpis?.workloadPressure >= 40 ? "text-amber-400" : "text-emerald-400",
      navPath: "/hod/reports",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-card backdrop-blur-xl border-border rounded-2xl p-5 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-accent rounded w-1/3" />
              <div className="h-8 bg-accent rounded w-1/2" />
              <div className="h-3 bg-accent rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -2 }}
          onClick={() => navigate(card.navPath)}
          className="relative overflow-hidden group cursor-pointer"
        >
          <StatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            isPositive={card.isPositive}
            delay={0}
            iconBgClass={card.iconBgClass}
            iconClass={card.iconClass}
            trendShowIcon={true}
            titleClass="text-xs text-muted-foreground font-medium mt-1"
            valueClass="text-2xl font-bold text-foreground tracking-tight"
            trendSize="text-[10px]"
            className="p-5"
          >
            <TrendIndicator
              current={card.key === "engagementRate" ? kpis?.engagementRate : card.key === "activeLecturers" ? kpis?.activeLecturers : card.key === "studentParticipation" ? kpis?.studentParticipation : kpis?.workloadPressure}
              previous={
                card.key === "engagementRate" ? kpis?.previousEngagementRate :
                card.key === "activeLecturers" ? kpis?.previousActiveLecturers :
                card.key === "studentParticipation" ? kpis?.previousParticipation :
                kpis?.previousWorkload
              }
              label={card.baselineText}
            />
            <ContextualInsight
              kpiKey={card.key}
              value={
                card.key === "engagementRate" ? kpis?.engagementRate :
                card.key === "activeLecturers" ? kpis?.activeLecturers :
                card.key === "studentParticipation" ? kpis?.studentParticipation :
                kpis?.workloadPressure
              }
            />
          </StatCard>

          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
}
