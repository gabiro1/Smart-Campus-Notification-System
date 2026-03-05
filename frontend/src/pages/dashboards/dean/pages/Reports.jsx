import GlassCard from "../components/GlassCard";
import {
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const performanceData = [
  { name: "CS", impact: 92 },
  { name: "Math", impact: 88 },
  { name: "Physics", impact: 76 },
  { name: "Eng", impact: 85 },
  { name: "Bio", impact: 89 },
];

const growthData = [
  { month: "Jul", engagement: 65 },
  { month: "Aug", engagement: 72 },
  { month: "Sep", engagement: 85 },
  { month: "Oct", engagement: 91 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Executive Reports
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Generate and export college-wide communication summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard delay={0.1} className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-neutral-400 font-medium">
              Overall Engagement Growth
            </p>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              +14.2%{" "}
              <span className="text-sm font-normal text-neutral-500 ml-2">
                vs last quarter
              </span>
            </h3>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="flex items-center gap-5">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-sm text-neutral-400 font-medium">
              Top Performing Department
            </p>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
              Computer Science{" "}
              <span className="text-sm font-normal text-neutral-500 ml-2">
                92% Impact
              </span>
            </h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Chart */}
        <GlassCard delay={0.3} className="h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={18} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Department Performance Ranking
            </h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  stroke="#525252"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#a3a3a3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="impact"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Impact Trends Area Chart */}
        <GlassCard delay={0.4} className="h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={18} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              Announcement Impact Trends
            </h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growthData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorEngagement"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
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
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
