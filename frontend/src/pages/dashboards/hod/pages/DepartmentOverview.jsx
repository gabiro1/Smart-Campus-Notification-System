import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import {
  Users,
  FileText,
  Activity,
  Megaphone,
  ArrowRight,
  CheckSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const chartData = [
  { name: "Mon", engagement: 400 },
  { name: "Tue", engagement: 300 },
  { name: "Wed", engagement: 550 },
  { name: "Thu", engagement: 450 },
  { name: "Fri", engagement: 700 },
  { name: "Sat", engagement: 200 },
  { name: "Sun", engagement: 350 },
];

export default function DepartmentOverview() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Overview
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Computer Science communication activity at a glance.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Student Participation"
          value="84%"
          icon={Users}
          trend="+2.5%"
          delay={0.1}
        />
        <StatCard
          title="Compliance Rate"
          value="98%"
          icon={CheckSquare}
          trend="+1.2%"
          delay={0.2}
        />
        <StatCard
          title="Active Lecturers"
          value="24"
          icon={Activity}
          delay={0.3}
        />
        <StatCard
          title="Announcements"
          value="156"
          icon={Megaphone}
          trend="+12"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <GlassCard
          delay={0.5}
          className="lg:col-span-2 h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-semibold text-white mb-6">
            Engagement Trends
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="colorEngagement"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#525252"
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
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard delay={0.6} className="flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Recent Broadcasts
            </h2>
            <Link
              to="/hod/announcements"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 group cursor-pointer"
              >
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <div>
                  <p className="text-sm font-medium text-neutral-200 group-hover:text-blue-400 transition-colors">
                    Midterm Schedule Released
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Dr. Alan Turing • 2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
