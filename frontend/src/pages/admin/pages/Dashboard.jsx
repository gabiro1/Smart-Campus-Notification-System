import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ArrowUpRight, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {/* Header with breadcrumbs style */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 tracking-widest mb-1">
              <span>ADMIN</span>
              <span>/</span>
              <span className="text-white uppercase">Overview</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
          </div>

          <button className="bg-white text-black text-xs font-bold py-3 px-3 rounded-[7px] flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-xl active:scale-95">
            <Plus size={18} />
            Create Alert
          </button>
        </header>

        {/* Action Row */}
        <div className="flex items-center mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600"
              size={16}
            />
            <input
              type="text"
              placeholder="Search students or departments..."
              className="w-full bg-[#111111] border border-white/10 rounded-[7px] py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-700"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-[#111111] border border-white/5 px-4 py-2.5 rounded-[7px] text-xs font-bold text-neutral-300 flex items-center gap-2 hover:border-white/20">
              <Filter size={14} /> Filter View
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <StatCard
            title="Active Alerts"
            value="12"
            change="+2 today"
            color="text-blue-500"
            trend="up"
          />
          <StatCard
            title="Targeted Students"
            value="4,250"
            change="89% Read Rate"
            color="text-green-500"
            trend="up"
          />
          <StatCard
            title="AI Accuracy"
            value="94.2%"
            change="+1.2% this week"
            color="text-purple-500"
            trend="up"
          />
        </div>

        {/* Chart & Urgent Notifications Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart Card */}
          <motion.div
            whileHover={{ y: -1, backgroundColor: "#0F0F0F" }}
            className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[10px] p-8 relative overflow-hidden h-[450px]"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold">Engagement by Department</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Daily notification reach across colleges
                </p>
              </div>
              <div className="flex bg-[#161616] border border-white/5 rounded-xl p-1 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                <span className="px-3 py-1.5 bg-[#252525] text-white rounded-lg cursor-pointer">
                  1W
                </span>
                <span className="px-3 py-1.5 hover:text-neutral-300 cursor-pointer">
                  1M
                </span>
                <span className="px-3 py-1.5 hover:text-neutral-300 cursor-pointer">
                  1Y
                </span>
              </div>
            </div>

            {/* Numbers Overlay for Departments */}
            <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
              <div className="border-l border-blue-500/30 pl-3">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  CST
                </p>
                <p className="text-lg font-bold">
                  1.2k <span className="text-[10px] text-green-500">+4%</span>
                </p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  CMHS
                </p>
                <p className="text-lg font-bold">840</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  CBE
                </p>
                <p className="text-lg font-bold">2.1k</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                  CE
                </p>
                <p className="text-lg font-bold">450</p>
              </div>
            </div>

            {/* Visual Chart with Axes */}
            <div className="relative w-full h-48 mt-10">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-neutral-600 font-bold pr-2 border-r border-white/5">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <svg
                viewBox="0 0 400 100"
                className="w-full h-full stroke-blue-500 fill-none ml-4"
                preserveAspectRatio="none"
              >
                <path
                  strokeWidth="2"
                  d="M0,80 C40,70 80,95 120,40 C160,10 200,80 240,30 C280,10 320,50 400,20"
                />
                <path
                  strokeWidth="0"
                  fill="url(#gradient)"
                  d="M0,80 C40,70 80,95 120,40 C160,10 200,80 240,30 C280,10 320,50 400,20 L400,100 L0,100 Z"
                  opacity="0.1"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X-Axis Labels */}
              <div className="flex justify-between mt-4 ml-8 text-[9px] text-neutral-600 font-bold uppercase tracking-tighter">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </motion.div>

          {/* Urgent Notifications Container */}
          <motion.div
            whileHover={{ y: -1, backgroundColor: "#0F0F0F" }}
            className="bg-[#0D0D0D] border border-white/5 rounded-[10px] p-7 flex flex-col h-[450px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Urgent Pulses</h3>
              <span className="bg-red-500/10 text-red-500 text-[9px] px-2 py-1 rounded-md font-bold tracking-widest">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto  custom-scrollbar">
              {[
                {
                  title: "Exam Venue Change",
                  sub: "Level 4 IT • 2m ago",
                  color: "bg-red-500",
                },
                {
                  title: "Network Maintenance",
                  sub: "All Students • 15m ago",
                  color: "bg-orange-500",
                },
                {
                  title: "Holiday Announcement",
                  sub: "UR Guild • 1h ago",
                  color: "bg-blue-500",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-center px-4 py-2 bg-[#141414] rounded-[10px] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div
                    className={`w-2 h-2 ${item.color} rounded-full animate-pulse`}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-200 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-auto w-full    text-[11px] font-bold text-neutral-400 hover:text-white transition-all">
              View All
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, color, trend }) {
  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "#0F0F0F" }}
      className="bg-[#0D0D0D] p-7 rounded-[10px] border border-white/5 shadow-sm transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-white font-black text-xm tracking-wide">{title}</p>
        {trend === "up" && (
          <TrendingUp size={14} className="text-green-500 opacity-50" />
        )}
      </div>

      <h2 className={`text-4xl font-bold tracking-tighter ${color} mb-4`}>
        {value}
      </h2>

      <div className="flex items-center gap-2">
        <span className="bg-white/[0.03] text-[10px] font-bold px-2 py-1.5 rounded-lg text-neutral-400 border border-white/5">
          {change}
        </span>
      </div>
    </motion.div>
  );
}
