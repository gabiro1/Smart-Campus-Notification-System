/**
 * @page LecturerDashboard
 * @description Specialized portal for academic staff to manage real-time communication.
 * PROBLEM SOLVED: Removes the "CP Middleman" bottleneck.
 * FEATURE: One-click "No Class" or "Venue Change" broadcast.
 */

import { useState } from "react";
import { Users, Send, FileText, AlertCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MY_CLASSES = [
  { id: "BIT401", name: "Network Security", students: 120, level: "L4 IT" },
  { id: "BIT405", name: "Machine Learning", students: 85, level: "L4 CS" },
];

export default function LecturerDashboard() {
  const [selectedClass, setSelectedClass] = useState(MY_CLASSES[0]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Lecturer Console</h1>
        <p className="text-neutral-500">
          Direct-to-Student real-time broadcasting.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Selection Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Your Modules
          </h3>
          {MY_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`w-full p-5 rounded-3xl border text-left transition-all ${
                selectedClass.id === cls.id
                  ? "glass border-blue-500/50 bg-blue-600/5"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-blue-500 font-mono text-xs">
                  {cls.id}
                </span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md">
                  {cls.level}
                </span>
              </div>
              <p className="font-bold text-white">{cls.name}</p>
              <div className="flex items-center gap-2 mt-3 text-neutral-500 text-xs">
                <Users size={14} /> {cls.students} Enrolled
              </div>
            </button>
          ))}
        </div>

        {/* Action Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[40px] border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Broadcast to{" "}
              <span className="text-blue-500">{selectedClass.name}</span>
            </h3>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <QuickActionBtn
                icon={<AlertCircle className="text-red-500" />}
                label="No Class Today"
                color="hover:bg-red-500/10"
              />
              <QuickActionBtn
                icon={<MapPin className="text-yellow-500" />}
                label="Venue Changed"
                color="hover:bg-yellow-500/10"
              />
            </div>

            <textarea
              className="w-full glass p-5 rounded-3xl h-40 outline-none focus:ring-2 ring-blue-600 mb-6"
              placeholder={`Message all ${selectedClass.students} students in ${selectedClass.id}...`}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-blue-600"
                />
                <span>Trigger Instant SMS Fallback</span>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all">
                Broadcast Now <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, color }) {
  return (
    <button
      className={`p-4 rounded-2xl border border-white/5 flex items-center gap-3 transition-all ${color}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
