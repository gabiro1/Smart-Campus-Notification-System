import GlassCard from "../components/GlassCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Filter, Calendar } from "lucide-react";

// Mock Data
const engagementTrends = [
  { name: "Week 1", opens: 4000, clicks: 2400 },
  { name: "Week 2", opens: 3000, clicks: 1398 },
  { name: "Week 3", opens: 2000, clicks: 9800 },
  { name: "Week 4", opens: 2780, clicks: 3908 },
  { name: "Week 5", opens: 1890, clicks: 4800 },
  { name: "Week 6", opens: 2390, clicks: 3800 },
];

const deliveryStats = [
  { name: "Delivered", value: 92 },
  { name: "Bounced", value: 3 },
  { name: "Unopened", value: 5 },
];
const COLORS = ["#3b82f6", "#ef4444", "#6b7280"];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            College Analytics
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Macro-level insights into communication effectiveness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white transition-colors">
            <Calendar size={16} /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white transition-colors">
            <Filter size={16} /> All Departments
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Participation Trends */}
        <GlassCard
          delay={0.1}
          className="lg:col-span-2 h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-semibold text-white mb-6">
            Engagement Over Time
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={engagementTrends}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
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
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#a3a3a3" }}
                />
                <Line
                  type="monotone"
                  dataKey="opens"
                  name="Total Opens"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  name="Link Interactions"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pie Chart: Delivery Success */}
        <GlassCard delay={0.2} className="h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-2">
            Delivery Success Rate
          </h2>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deliveryStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#a3a3a3" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
