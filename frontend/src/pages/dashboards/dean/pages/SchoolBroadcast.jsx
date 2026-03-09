import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Send,
  UploadCloud,
  Clock,
  Globe,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SchoolBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetDept, setTargetDept] = useState("All Departments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmBroadcast = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSent(false);
      setTitle("");
      setMessage("");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          School Broadcast
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Send executive announcements across all or specific departments.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <GlassCard className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Compose Global Message
              </h2>
              <p className="text-xs text-neutral-500">
                This message will be distributed network-wide.
              </p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Subject Line
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Campus Closure Notice"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Target Departments
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Sciences">
                    Sciences (Physics, Bio, Chem)
                  </option>
                  <option value="Engineering">Engineering & CS</option>
                  <option value="Arts">Arts & Humanities</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Target Year Levels
                </label>
                <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                  <option value="all">All Students</option>
                  <option value="undergrad">Undergraduates Only</option>
                  <option value="postgrad">Postgraduates Only</option>
                  <option value="staff">Staff & Faculty Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Official Message
              </label>
              <textarea
                required
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 resize-none"
                placeholder="Draft the executive announcement..."
              />
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2 active:scale-95"
              >
                <Send size={18} /> Distribute Broadcast
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Live Preview Pane */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">
            End-User Preview
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className="relative overflow-hidden border-blue-500/20"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px]">
                <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center text-xs font-bold text-white">
                  Dean
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  Office of the Dean{" "}
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] uppercase border border-blue-500/20">
                    University Notice
                  </span>
                </p>
                <p className="text-xs text-neutral-500">Target: {targetDept}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-3 relative z-10 break-words">
              {title || "Your executive subject line..."}
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 relative z-10 whitespace-pre-wrap break-words min-h-[100px]">
              {message ||
                "The body of your official broadcast will appear here exactly as students and faculty will see it..."}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-black/40 p-2.5 rounded-lg w-fit border border-white/5 relative z-10">
              <Clock size={14} /> Will be sent immediately upon confirmation
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl z-10 text-center"
            >
              {isSent ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Broadcast Initiated
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Message is being distributed to {targetDept}.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <AlertCircle size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Confirm Distribution
                  </h2>
                  <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
                    You are about to send an official broadcast to{" "}
                    <strong>{targetDept}</strong>. This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmBroadcast}
                      className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                    >
                      Yes, Distribute Now
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
