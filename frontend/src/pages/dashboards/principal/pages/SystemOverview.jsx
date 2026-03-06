import GlassCard from "../components/GlassCard";
import {
  Users,
  Server,
  Activity,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const volumeData = [
  { time: "00:00", messages: 120 },
  { time: "04:00", messages: 80 },
  { time: "08:00", messages: 3500 },
  { time: "12:00", messages: 4200 },
  { time: "16:00", messages: 2800 },
  { time: "20:00", messages: 950 },
];

const roleData = [
  { role: "Students", active: 12400 },
  { role: "Lecturers", active: 850 },
  { role: "HoDs", active: 45 },
  { role: "Deans", active: 8 },
];

export default function SystemOverview() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Real-time monitoring of campus-wide communication infrastructure.
        </p>
      </header>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: "Total Active Users",
            val: "14,303",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            title: "Messages Sent Today",
            val: "42.8k",
            icon: Activity,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            title: "System Uptime",
            val: "99.99%",
            icon: Server,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            title: "Delivery Success Rate",
            val: "98.7%",
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
        ].map((stat, i) => (
          <GlassCard key={i} delay={i * 0.1} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div
                className={`p-3 rounded-xl border border-white/5 ${stat.bg}`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
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
        {/* Real-time Volume Chart */}
        <GlassCard
          delay={0.4}
          className="lg:col-span-2 h-[420px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                System Message Volume
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Rolling 24-hour activity
              </p>
            </div>
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
              Live
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={volumeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorMessages"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorMessages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Role Distribution */}
        <GlassCard delay={0.5} className="flex flex-col h-[420px]">
          <h2 className="text-lg font-semibold text-white mb-6">
            Active Sessions by Role
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roleData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="role"
                  type="category"
                  stroke="#a3a3a3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="active"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Audit Log / Recent System Activity */}
      <GlassCard delay={0.6} className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-semibold text-white">System Audit Log</h2>
          <button className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300">
            View Full Log <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Action Performed</th>
                <th className="p-4 font-semibold">Module</th>
                <th className="p-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {[
                {
                  user: "Dean of Arts",
                  action: "Approved Dept Broadcast",
                  mod: "Approvals",
                  time: "2 mins ago",
                },
                {
                  user: "System Auto",
                  action: "Database Backup Completed",
                  mod: "Maintenance",
                  time: "15 mins ago",
                },
                {
                  user: "HoD Science",
                  action: "Created New Role: Assistant Lecturer",
                  mod: "RBAC",
                  time: "1 hour ago",
                },
                {
                  user: "Principal Admin",
                  action: "Updated Global Security Policy",
                  mod: "Settings",
                  time: "3 hours ago",
                },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white font-medium">{log.user}</td>
                  <td className="p-4 text-neutral-300">{log.action}</td>
                  <td className="p-4">
                    <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-xs text-neutral-400">
                      {log.mod}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-500 font-mono text-xs">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
