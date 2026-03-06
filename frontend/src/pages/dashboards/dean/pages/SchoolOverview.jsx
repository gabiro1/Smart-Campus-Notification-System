import GlassCard from "../components/GlassCard";
import {
  Users,
  Building2,
  Megaphone,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Mock Data
const deptData = [
  { name: "Computer Sci", sent: 145, openRate: 88 },
  { name: "Engineering", sent: 112, openRate: 82 },
  { name: "Mathematics", sent: 68, openRate: 94 },
  { name: "Physics", sent: 85, openRate: 76 },
  { name: "Biology", sent: 94, openRate: 89 },
];

export default function SchoolOverview() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          School Overview
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Cross-departmental insights and communication metrics.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: "Total Announcements",
            val: "1,248",
            icon: Megaphone,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            title: "Avg. Student Participation",
            val: "86.4%",
            icon: Users,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            title: "Department Compliance",
            val: "94%",
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            title: "Active Departments",
            val: "12",
            icon: Building2,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <GlassCard key={i} delay={i * 0.1} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div
                className={`p-3 rounded-xl border border-white/5 ${stat.bg}`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs font-medium bg-white/5 px-2 py-1 rounded-md text-emerald-400 flex items-center gap-1">
                <TrendingUp size={12} /> +2%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {stat.val}
              </h3>
              <p className="text-sm text-neutral-400 font-medium mt-1">
                {stat.title}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Component */}
        <GlassCard
          delay={0.4}
          className="lg:col-span-2 h-[420px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">
              Department Volume vs. Open Rates
            </h2>
            <select className="bg-black/40 border border-white/10 text-xs text-neutral-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500/50">
              <option>This Semester</option>
              <option>Last Semester</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="sent"
                  name="Announcements Sent"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  yAxisId="right"
                  dataKey="openRate"
                  name="Avg Open Rate %"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Dept Activity Table (Simplified) */}
        <GlassCard delay={0.5} className="flex flex-col h-[420px] p-0">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">
              Recent Activity Alerts
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {[
              {
                d: "Engineering",
                msg: "HoD broadcasted to all Year 1s",
                time: "10 mins ago",
                type: "info",
              },
              {
                d: "Mathematics",
                msg: "Approval backlog detected (12+)",
                time: "1 hr ago",
                type: "warning",
              },
              {
                d: "Biology",
                msg: "Participation dropped by 8% this week",
                time: "3 hrs ago",
                type: "warning",
              },
              {
                d: "Computer Sci",
                msg: "New role permissions updated",
                time: "Yesterday",
                type: "info",
              },
            ].map((alert, i) => (
              <div
                key={i}
                className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${alert.type === "warning" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}
                  >
                    {alert.d}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm text-neutral-300">{alert.msg}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
