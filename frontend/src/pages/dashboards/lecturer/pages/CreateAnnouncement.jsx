import GlassCard from "../components/GlassCard";
import { Sparkles, Send, Clock } from "lucide-react";

export default function CreateAnnouncement() {
  const categories = ["Exam", "Assignment", "Reminder", "Lecture Update"];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Compose
        </h1>
        <p className="text-neutral-400">
          Broadcast messages to your classes instantly.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <GlassCard className="lg:col-span-7 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g., Update on Tomorrow's Lecture"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Message Body
            </label>
            <textarea
              rows="6"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600 resize-none"
              placeholder="Write your announcement here..."
            />
          </div>

          {/* AI Categories */}
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-neutral-300">
                AI Suggested Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Target Class
              </label>
              <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none">
                <option value="">Select a class...</option>
                <option value="cs101">Computer Science 101</option>
                <option value="eng201">Engineering Math 201</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Send Timing
              </label>
              <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none">
                <option value="now">Send Immediately</option>
                <option value="schedule">Schedule for later</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Save Draft
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
              <Send size={16} /> Broadcast
            </button>
          </div>
        </GlassCard>

        {/* Live Preview Pane */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider px-2">
            Live Preview
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className="relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center">
                L
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Your Name</p>
                <p className="text-xs text-neutral-500">Lecturer • CS101</p>
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              Update on Tomorrow's Lecture
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              Your message body will appear here. This preview shows exactly how
              students will see the notification on their devices...
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white/[0.02] p-2 rounded-lg w-fit border border-white/5">
              <Clock size={12} /> Just now
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
