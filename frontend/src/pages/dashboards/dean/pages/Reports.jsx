import { GlassCard } from "@/components/shared";
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Executive Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and export college-wide communication summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-accent hover:bg-white/10 border border-border text-neutral-300 hover:text-foreground px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FileSpreadsheet size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
            <Download size={14} /> <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <GlassCard delay={0.1} className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5">
          <div className="p-3 sm:p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Overall Engagement Growth
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
              +14.2%{" "}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2">
                vs last quarter
              </span>
            </h3>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5">
          <div className="p-3 sm:p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Top Performing Department
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight mt-1">
              Computer Science{" "}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2">
                92% Impact
              </span>
            </h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Department Performance Chart */}
        <GlassCard delay={0.3} className="h-[300px] sm:h-[400px] flex flex-col p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <FileText size={16} className="text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Department Performance Ranking
            </h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  stroke="#525252"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#a3a3a3"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="impact"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Impact Trends Area Chart */}
        <GlassCard delay={0.4} className="h-[300px] sm:h-[400px] flex flex-col p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <TrendingUp size={16} className="text-purple-400" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
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
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
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
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#8b5cf6"
                  strokeWidth={2}
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
