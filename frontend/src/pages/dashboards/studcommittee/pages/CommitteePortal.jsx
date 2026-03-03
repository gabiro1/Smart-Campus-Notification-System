/**
 * @page CommitteePortal
 * @description Single dashboard that morphs based on the student's title.
 */
import { useState } from "react";
import {
  Scale,
  Award,
  Megaphone,
  Send,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import PollCreator from "../components/PollCreator";

export default function CommitteePortal({ user }) {
  // Identity Config: Speaker gets purple/Scale, President gets blue/Award
  const configs = {
    Speaker: {
      theme: "text-purple-400 border-purple-500/30",
      icon: <Scale />,
      label: "Parliamentary",
    },
    President: {
      theme: "text-blue-400 border-blue-500/30",
      icon: <Award />,
      label: "Executive",
    },
    Minister: {
      theme: "text-emerald-400 border-emerald-500/30",
      icon: <Megaphone />,
      label: "Portfolio",
    },
  };

  const activeConfig = configs[user.sub_role] || configs["President"];

  return (
    <div className="space-y-8 pb-20">
      {/* Identity Header */}
      <div className="glass p-8 rounded-[40px] border border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-2xl bg-white/5 ${activeConfig.theme}`}>
            {activeConfig.icon}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {user.sub_role}'s Portal
            </h1>
            <p className="text-neutral-500 text-sm">
              Official {activeConfig.label} Broadcaster
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${activeConfig.theme} bg-white/5`}
        >
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase">Verified Identity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broadcast Console */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border border-white/10">
          <h3 className="text-xl font-bold mb-6 italic">
            Broadcast Official Alert
          </h3>
          <div className="space-y-4">
            <input
              className="w-full glass p-4 rounded-2xl outline-none"
              placeholder="Announcement Headline..."
            />
            <textarea
              className="w-full glass p-4 rounded-2xl h-40 outline-none"
              placeholder="Enter message body..."
            />

            <PollCreator />

            <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
              Send as {user.sub_role} <Send size={20} />
            </button>
          </div>
        </div>

        {/* Stats & Audience */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-[32px] border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="text-blue-500" />
              <h4 className="font-bold">Audience Reach</h4>
            </div>
            <div className="text-4xl font-black italic text-white">12,402</div>
            <p className="text-[10px] text-neutral-500 uppercase font-bold mt-1">
              Total Verified Students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
