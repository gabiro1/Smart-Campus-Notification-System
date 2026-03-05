import GlassCard from "../components/GlassCard";
import { Users, CalendarDays, CheckCircle, Flame } from "lucide-react";

const stats = [
  {
    label: "Total Events",
    value: "24",
    icon: CalendarDays,
    trend: "+3 this week",
  },
  {
    label: "Student Participation",
    value: "8,432",
    icon: Users,
    trend: "+12% vs last month",
  },
  {
    label: "Feedback Score",
    value: "4.8/5",
    icon: CheckCircle,
    trend: "Stable",
  },
  {
    label: "Active Campaigns",
    value: "3",
    icon: Flame,
    trend: "High engagement",
  },
];

export default function Overview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          President's Overview
        </h1>
        <p className="text-neutral-400">
          Campus pulse and engagement metrics at a glance.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <GlassCard
            key={stat.label}
            delay={index * 0.1}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <stat.icon size={20} className="text-blue-400" />
              </div>
              <span className="text-xs font-medium text-neutral-500 bg-white/[0.03] px-2 py-1 rounded-full border border-white/[0.05]">
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-neutral-400 font-medium mt-1">
                {stat.label}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <GlassCard
          delay={0.4}
          className="lg:col-span-2 min-h-[300px] flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-4">
            Event Engagement Trends
          </h3>
          <div className="flex-1 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-center">
            {/* Insert actual chart component (Recharts/Chart.js) here */}
            <p className="text-neutral-600 text-sm">
              [ Engagement Chart Rendered Here ]
            </p>
          </div>
        </GlassCard>

        {/* Recent Feedback */}
        <GlassCard delay={0.5} className="flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <p className="text-sm text-neutral-300 font-medium line-clamp-2">
                  "The tech seminar was amazing, but we need more seating!"
                </p>
                <p className="text-xs text-blue-400 mt-2">2 hours ago</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
