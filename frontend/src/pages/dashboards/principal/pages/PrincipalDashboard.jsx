import { useState, useEffect } from "react";
import Navbar from "../../../../layouts/Navbar";
import Footer from "../../../../layouts/Footer";
import ApprovalQueue from "../../../../shared/ApprovalQueue";
import { BarChart3, Users, Zap, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PrincipalDashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 md:p-12 pt-32 max-w-7xl mx-auto w-full space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 tracking-widest mb-1 uppercase font-black">
              <span>College Administration</span>
              <span>/</span>
              <span className="text-blue-500">Principal Command Center</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              College Oversight
            </h1>
            <p className="text-neutral-500 font-medium mt-1">
              Strategic management for all Schools and Departments.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-neutral-400">
                System Heartbeat: Optimal
              </span>
            </div>
          </div>
        </header>

        {/* Global College Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value="12,840"
            icon={<Users size={20} />}
            color="text-blue-500"
          />
          <StatCard
            title="College Reach"
            value="98.2%"
            icon={<Globe size={20} />}
            color="text-emerald-500"
          />
          <StatCard
            title="SMS Quota"
            value="45k"
            icon={<Zap size={20} />}
            color="text-yellow-500"
          />
          <StatCard
            title="Security Status"
            value="Verified"
            icon={<ShieldCheck size={20} />}
            color="text-purple-500"
          />
        </div>

        {/* The Central Approval Engine */}
        <section className="space-y-6">
          <div className="p-1 bg-gradient-to-r from-blue-500/20 to-transparent rounded-[40px]">
            <div className="bg-[#0a0a0a] rounded-[38px] p-8 border border-white/5">
              <ApprovalQueue />
            </div>
          </div>
        </section>

        {/* Cross-School Performance Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/5 h-[400px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} /> Inter-School
              Engagement
            </h3>
            {/* Visual Chart Placeholder */}
            <div className="flex items-end justify-between h-48 gap-4 px-4">
              {[70, 45, 90, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-blue-600/20 border-t-2 border-blue-500 rounded-t-xl"
                  />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    School {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border border-white/5">
            <h3 className="text-lg font-bold mb-4">Infrastructure Health</h3>
            <div className="space-y-6 mt-6">
              <HealthBar
                label="AI Matching Logic"
                percentage={94}
                color="bg-purple-500"
              />
              <HealthBar
                label="SMS Gateway Uptime"
                percentage={100}
                color="bg-emerald-500"
              />
              <HealthBar
                label="Database Synchronization"
                percentage={88}
                color="bg-blue-500"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="glass p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group">
      <div
        className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 ${color} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
        {title}
      </p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
    </div>
  );
}

function HealthBar({ label, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-neutral-400">{label}</span>
        <span className="text-white">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
