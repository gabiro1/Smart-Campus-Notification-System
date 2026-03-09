import GlassCard from "../components/GlassCard";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Filter, Calendar, Zap, Bot, MailCheck } from "lucide-react";

// Mock Data
const networkLoadData = [
  { day: "Mon", capacity: 40, peak: 60 },
  { day: "Tue", capacity: 30, peak: 45 },
  { day: "Wed", capacity: 65, peak: 85 },
  { day: "Thu", capacity: 45, peak: 70 },
  { day: "Fri", capacity: 80, peak: 95 },
  { day: "Sat", capacity: 20, peak: 35 },
  { day: "Sun", capacity: 15, peak: 25 },
];

const aiAccuracyData = [
  { module: "Categorization", accuracy: 96 },
  { module: "Summarization", accuracy: 92 },
  { module: "Priority Flagging", accuracy: 98 },
  { module: "Spam Filter", accuracy: 99 },
];

export default function SystemAnalytics() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            System Analytics & Health
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Deep infrastructure metrics and AI performance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white transition-colors">
            <Calendar size={16} /> Last 7 Days
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard delay={0.1} className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <MailCheck size={28} />
          </div>
          <div>
            <p className="text-sm text-neutral-400 font-bold">
              Global Delivery Rate
            </p>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              99.8%
            </h3>
          </div>
        </GlassCard>
        <GlassCard delay={0.2} className="flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
            <Zap size={28} />
          </div>
          <div>
            <p className="text-sm text-neutral-400 font-bold">
              Avg Response Time
            </p>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              42ms
            </h3>
          </div>
        </GlassCard>
        <GlassCard delay={0.3} className="flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
            <Bot size={28} />
          </div>
          <div>
            <p className="text-sm text-neutral-400 font-bold">
              AI Confidence Score
            </p>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              96.2%
            </h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Load Area Chart */}
        <GlassCard delay={0.4} className="h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">
            Network Load & Peak Capacity
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={networkLoadData}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="day"
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
                  dataKey="peak"
                  name="Peak Threshold %"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  name="Actual Load %"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorCap)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Performance Bar Chart */}
        <GlassCard delay={0.5} className="h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6">
            AI Module Accuracy Matrix
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aiAccuracyData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="module"
                  type="category"
                  stroke="#a3a3a3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={100}
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
                  dataKey="accuracy"
                  name="Accuracy %"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
