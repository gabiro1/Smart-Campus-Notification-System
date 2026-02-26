/**
 * @page HoDDashboard
 * @description The highest administrative level for a specific department.
 * RESPONSIBILITIES:
 * 1. Verification of Pending Alerts (Quality Control)
 * 2. Department-wide Strategic Broadcasting
 * 3. Staff/Module Oversight
 */

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Users,
  BarChart3,
  BellRing,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const PENDING_APPROVALS = [
  {
    id: 101,
    sender: "Lecturer: Dr. Jean",
    title: "Extra Lab Session",
    target: "L3 CS",
    time: "10 mins ago",
  },
  {
    id: 102,
    sender: "Guild Rep: Alice",
    title: "Dept Sports Day",
    target: "All IT",
    time: "25 mins ago",
  },
];

export default function HoDDashboard() {
  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">HoD Command Center</h1>
          <p className="text-neutral-500 text-sm">
            Dept. of Computer Science & IT
          </p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-2 rounded-xl text-xs font-bold text-blue-400 border border-blue-500/20">
            Active Students: 1,420
          </div>
        </div>
      </header>

      {/* 1. Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Broadcasts"
          value="128"
          icon={<BellRing className="text-blue-500" />}
        />
        <StatCard
          title="Avg. Reach"
          value="94%"
          icon={<Users className="text-green-500" />}
        />
        <StatCard
          title="Staff Activity"
          value="12 Active"
          icon={<BarChart3 className="text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Verification Queue */}
        <div className="glass p-8 rounded-[40px] border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Pending Verification</h3>
            <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-1 rounded-md font-black">
              ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-4">
            {PENDING_APPROVALS.map((req) => (
              <div
                key={req.id}
                className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{req.title}</h4>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {req.sender} → {req.target}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white rounded-xl transition-all">
                    <CheckCircle size={18} />
                  </button>
                  <button className="p-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all">
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Department-Wide Quick Broadcast */}
        <div className="glass p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-blue-600/5 to-transparent">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="text-blue-500" /> Strategic Broadcast
          </h3>
          <p className="text-xs text-neutral-400 mb-6">
            Send an official department-level announcement to all students and
            staff.
          </p>

          <div className="space-y-4">
            <input
              className="w-full glass p-4 rounded-2xl text-sm outline-none"
              placeholder="Announcement Headline..."
            />
            <textarea
              className="w-full glass p-4 rounded-2xl text-sm h-28 outline-none"
              placeholder="Official Message..."
            />
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all">
              Authorize & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
      </div>
      <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">
        {title}
      </p>
      <h4 className="text-3xl font-black text-white mt-1">{value}</h4>
    </div>
  );
}
