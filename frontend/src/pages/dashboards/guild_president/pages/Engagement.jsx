import GlassCard from "../components/GlassCard";
import { BarChart3, PlusCircle, Users, CheckSquare } from "lucide-react";

export default function Engagement() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Student Engagement
        </h1>
        <p className="text-neutral-400">
          Measure interaction and gather student opinions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Poll Creation Widget */}
        <GlassCard className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PlusCircle size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Create Quick Poll
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Question
              </label>
              <textarea
                rows="2"
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                placeholder="What should be the theme for..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-neutral-400">Options</label>
              <input
                type="text"
                placeholder="Option A"
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
              <input
                type="text"
                placeholder="Option B"
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <button className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-medium py-2 rounded-xl transition-all">
              + Add Option
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] mt-4">
              Launch Poll
            </button>
          </div>
        </GlassCard>

        {/* Analytics & Active Polls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <GlassCard delay={0.1} className="p-5 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Users size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400 font-medium">
                  Avg. Event Attendance
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  452 <span className="text-xs text-green-400 ml-2">↑ 8%</span>
                </h3>
              </div>
            </GlassCard>
            <GlassCard delay={0.2} className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckSquare size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400 font-medium">
                  Poll Response Rate
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  68%{" "}
                  <span className="text-xs text-emerald-400 ml-2">Healthy</span>
                </h3>
              </div>
            </GlassCard>
          </div>

          <GlassCard delay={0.3} className="h-64 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Active Poll Results
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                Live
              </span>
            </div>

            {/* Visual representation of a liquid bar chart */}
            <div className="space-y-4 flex-1">
              <p className="text-sm text-neutral-300 font-medium mb-4">
                "Which venue do you prefer for the Spring Gala?"
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-neutral-400 mb-1">
                  <span>Main Auditorium</span>
                  <span>65%</span>
                </div>
                <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] relative">
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-r-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-neutral-400 mb-1">
                  <span>Open Air Arena</span>
                  <span>35%</span>
                </div>
                <div className="w-full h-3 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-white/20 w-[35%] rounded-full" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
