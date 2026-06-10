import React from "react";
import GlassCard from "../components/GlassCard";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  ClipboardList,
  Calendar,
  TrendingUp,
  Users,
  FileCheck,
  AlertCircle,
  FileText
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

// Mock Data representing Registrar operations (Student Onboarding Analytics)
const registrationTrends = [
  { name: "Mon", registered: 45, verificationRate: 98 },
  { name: "Tue", registered: 62, verificationRate: 95 },
  { name: "Wed", registered: 89, verificationRate: 92 },
  { name: "Thu", registered: 55, verificationRate: 96 },
  { name: "Fri", registered: 73, verificationRate: 94 },
];

export default function RegistrarDashboard() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "New Student",
      desc: "Register a new student profile",
      icon: UserPlus,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      path: "/registrar/new-student",
    },
    {
      label: "Student Records",
      desc: "View & manage academic files",
      icon: ClipboardList,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      path: "/registrar/students",
    },
    {
      label: "Campus Events",
      desc: "Manage and sync system events",
      icon: Calendar,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      path: "/registrar/events",
    },
  ];

  const stats = [
    {
      title: "Total Enrolled",
      val: "4,820",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      growth: "+3.4%",
    },
    {
      title: "Pending Verifications",
      val: "42",
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      growth: "-12%",
    },
    {
      title: "Certificates Issued",
      val: "312",
      icon: FileCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      growth: "+8%",
    },
    {
      title: "Active Programs",
      val: "16",
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      growth: "Static",
    },
  ];

  return (
    <div className="space-y-6 p-8 text-white">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Registrar Dashboard
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Student records · Academic administration & registry compliance.
        </p>
      </header>

      {/* Quick Actions Array - Modeled to fit standard dashboard flows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {actions.map((action, i) => (
          <GlassCard
            key={i}
            delay={i * 0.05}
            className="group flex flex-col justify-between p-5 hover:border-white/20 transition-all cursor-pointer min-h-[140px]"
            onClick={() => navigate(action.path)}
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border border-white/5 ${action.bg}`}>
                <action.icon size={20} className={action.color} />
              </div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest border border-white/5 px-2 py-0.5 rounded-md group-hover:text-white group-hover:border-white/10 transition-colors">
                Action
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white tracking-tight">
                {action.label}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">{action.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Analytics Counter Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={i} delay={(i + 3) * 0.05} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border border-white/5 ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs font-medium bg-white/5 px-2 py-1 rounded-md text-emerald-400 flex items-center gap-1">
                <TrendingUp size={12} /> {stat.growth}
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

      {/* Main Charts & Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Analytics Panel */}
        <GlassCard delay={0.4} className="lg:col-span-2 h-[420px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">
              Registration Pipeline & Verification Metrics
            </h2>
            <select className="bg-black/40 border border-white/10 text-xs text-neutral-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500/50">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={registrationTrends}
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
                  dataKey="registered"
                  name="Students Registered"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  yAxisId="right"
                  dataKey="verificationRate"
                  name="Verification %"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Audit / Live Activity Updates Panel */}
        <GlassCard delay={0.5} className="flex flex-col h-[420px] p-0">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">
              Registry Activity Logs
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {[
              {
                scope: "Enrollment",
                msg: "Batch 2026 CS student profiles created",
                time: "2 mins ago",
                type: "info",
              },
              {
                scope: "Compliance",
                msg: "Transcripts verification backlog high",
                time: "45 mins ago",
                type: "warning",
              },
              {
                scope: "System",
                msg: "Database sync complete with main faculty node",
                time: "2 hrs ago",
                type: "info",
              },
              {
                scope: "Records",
                msg: "3 student status changes requested by SE",
                time: "Yesterday",
                type: "warning",
              },
            ].map((alert, i) => (
              <div
                key={i}
                className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      alert.type === "warning"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {alert.scope}
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