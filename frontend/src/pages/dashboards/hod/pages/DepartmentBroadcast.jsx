import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { Send, UploadCloud, Clock, Radio } from "lucide-react";

export default function DepartmentBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Broadcast
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Send critical updates to all students in the department.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <GlassCard className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Radio size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Compose Message
              </h2>
              <p className="text-xs text-neutral-500">
                This bypasses the standard approval workflow.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Broadcast Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Department Townhall Meeting"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Message Details
              </label>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 resize-none"
                placeholder="Type your official announcement here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Target Level
                </label>
                <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                  <option value="all">All CS Students</option>
                  <option value="year1">Year 1 Only</option>
                  <option value="year4">Final Year (Year 4)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Schedule
                </label>
                <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                  <option value="now">Send Immediately</option>
                  <option value="later">Schedule for later...</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Attachment
              </label>
              <button className="w-full py-4 border-2 border-dashed border-white/10 hover:border-blue-500/30 bg-white/[0.01] hover:bg-blue-500/5 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-blue-400 transition-all">
                <UploadCloud size={24} />
                <span className="text-sm">
                  Click to upload official documents (PDF, DOCX)
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2 active:scale-95">
              <Send size={18} /> Broadcast Now
            </button>
          </div>
        </GlassCard>

        {/* Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">
            Student View Preview
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className="relative overflow-hidden group border-rose-500/20"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-rose-400 font-bold">
                HoD
              </div>
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  Head of Department{" "}
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] uppercase">
                    Official
                  </span>
                </p>
                <p className="text-xs text-neutral-500">Computer Science</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-3 relative z-10">
              {title || "Your broadcast title..."}
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 relative z-10 break-words whitespace-pre-wrap">
              {message ||
                "The body of your official broadcast will appear here exactly as students will see it on their mobile app or web portal."}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-black/40 p-2.5 rounded-lg w-fit border border-white/5 relative z-10">
              <Clock size={14} /> To be sent immediately
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
