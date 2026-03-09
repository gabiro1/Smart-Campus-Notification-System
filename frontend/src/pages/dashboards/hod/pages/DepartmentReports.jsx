import GlassCard from "../components/GlassCard";
import { Download, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const activityData = [
  { name: "Dr. Jenkins", sent: 12 },
  { name: "Prof. Turing", sent: 8 },
  { name: "Dr. Hopper", sent: 15 },
  { name: "Mr. Smith", sent: 5 },
  { name: "Dr. Lee", sent: 10 },
];

export default function DepartmentReports() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Generate comprehensive reports on department communication.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Download size={16} /> CSV
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <Download size={16} /> PDF Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecturer Activity Chart */}
        <GlassCard delay={0.1} className="h-96 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <BarChart2 size={18} />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Lecturer Output (This Month)
            </h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Placeholder for secondary metric */}
        <GlassCard
          delay={0.2}
          className="h-96 flex items-center justify-center border-dashed"
        >
          <div className="text-center">
            <p className="text-neutral-500 text-sm">
              Student Engagement by Course Chart
            </p>
            <p className="text-neutral-600 text-xs mt-1">
              (Add secondary Recharts component here)
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
