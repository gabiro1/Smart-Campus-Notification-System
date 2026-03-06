import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Send,
  AlertTriangle,
  Radio,
  Globe,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Standard");

  // CORRECTED: Hierarchical Targeting State (College -> School -> Department)
  const [scope, setScope] = useState("Entire College");
  const [specificTarget, setSpecificTarget] = useState("All");
  const [userRole, setUserRole] = useState("All Users");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isEmergency = priority === "Emergency";

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
      setPriority("Standard");
    }, 2500);
  };

  // Generate the final display string for the preview
  const getTargetDisplay = () => {
    if (scope === "Entire College") return `Entire College (${userRole})`;
    return `${specificTarget} (${userRole})`;
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            College Broadcast
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Deliver announcements to the entire College, specific Schools, or
            Departments.
          </p>
        </div>
        {isEmergency && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-sm font-bold animate-pulse w-fit">
            <AlertTriangle size={16} /> Emergency Override Active
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <GlassCard
          className={`lg:col-span-7 space-y-6 border transition-colors duration-500 ${isEmergency ? "border-rose-500/30 bg-rose-950/10" : ""}`}
        >
          <form onSubmit={handleSend} className="space-y-5">
            {/* Hierarchical Targeting Row */}
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4 mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-2">
                Targeting Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Scope Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">
                    Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => {
                      setScope(e.target.value);
                      setSpecificTarget("All"); // Reset specific target when scope changes
                    }}
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Entire College">Entire College</option>
                    <option value="School">Specific School</option>
                    <option value="Department">Specific Department</option>
                  </select>
                </div>

                {/* 2. Specific Target (Conditional based on Scope) */}
                <div
                  className={
                    scope === "Entire College"
                      ? "opacity-30 pointer-events-none"
                      : ""
                  }
                >
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">
                    {scope === "School"
                      ? "Select School"
                      : scope === "Department"
                        ? "Select Dept"
                        : "N/A"}
                  </label>
                  <select
                    value={specificTarget}
                    onChange={(e) => setSpecificTarget(e.target.value)}
                    disabled={scope === "Entire College"}
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {scope === "Entire College" && (
                      <option value="All">All Schools & Depts</option>
                    )}
                    {scope === "School" && (
                      <>
                        <option value="School of ICT">School of ICT</option>
                        <option value="School of Engineering">
                          School of Engineering
                        </option>
                        <option value="School of Science">
                          School of Science
                        </option>
                        <option value="School of Architecture">
                          School of Architecture
                        </option>
                      </>
                    )}
                    {scope === "Department" && (
                      <>
                        <option value="Information Technology">
                          Information Technology
                        </option>
                        <option value="Computer Science">
                          Computer Science
                        </option>
                        <option value="Software Engineering">
                          Software Engineering
                        </option>
                        <option value="Civil Engineering">
                          Civil Engineering
                        </option>
                      </>
                    )}
                  </select>
                </div>

                {/* 3. User Role */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">
                    User Roles
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Students Only">Students Only</option>
                    <option value="Staff Only">Staff Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                    isEmergency
                      ? "border-rose-500/50 focus:border-rose-400 text-rose-400 font-bold"
                      : "border-white/10 focus:border-emerald-500/50"
                  }`}
                >
                  <option value="Standard">Standard Information</option>
                  <option value="Emergency">CRITICAL EMERGENCY</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                Subject
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., College-wide Power Maintenance"
                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${isEmergency ? "border-rose-500/30" : "border-white/10"}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                Message
              </label>
              <textarea
                required
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all resize-none ${isEmergency ? "border-rose-500/30" : "border-white/10"}`}
                placeholder="Enter the official college-wide message..."
              />
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className={`text-white px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isEmergency
                    ? "bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                }`}
              >
                <Send size={18} />{" "}
                {isEmergency ? "DEPLOY EMERGENCY ALERT" : "Initiate Broadcast"}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Live User View Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">
            End-User Preview
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className={`relative overflow-hidden transition-colors duration-500 ${isEmergency ? "border-rose-500/40" : "border-white/10"}`}
          >
            <div
              className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-colors duration-500 ${isEmergency ? "bg-rose-600/20" : "bg-emerald-600/10"}`}
            />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isEmergency ? "bg-rose-600" : "bg-[#111] border border-white/20"}`}
              >
                {isEmergency ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Globe size={18} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  Office of the Principal
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${isEmergency ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-white/10 text-neutral-300 border-white/10"}`}
                  >
                    {priority}
                  </span>
                </p>
                <p className="text-xs text-neutral-500">
                  Target: {getTargetDisplay()}
                </p>
              </div>
            </div>

            <h2
              className={`text-xl font-bold mb-3 relative z-10 break-words ${isEmergency ? "text-rose-400" : "text-white"}`}
            >
              {title || "Your broadcast subject..."}
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 relative z-10 whitespace-pre-wrap break-words min-h-[100px]">
              {message ||
                "The body of the broadcast will appear here exactly as users will read it."}
            </p>
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
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md bg-[#050505] border rounded-2xl p-8 shadow-2xl z-10 text-center ${isEmergency ? "border-rose-500/50 shadow-[0_0_40px_rgba(225,29,72,0.2)]" : "border-white/10"}`}
            >
              {isSent ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${isEmergency ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Payload Delivered
                  </h2>
                  <p className="text-sm text-neutral-400 font-mono">
                    Successfully sent to: {getTargetDisplay()}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${isEmergency ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                  >
                    {isEmergency ? (
                      <ShieldAlert size={32} />
                    ) : (
                      <Globe size={32} />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Confirm Broadcast
                  </h2>
                  <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
                    You are transmitting a {priority} message to{" "}
                    <strong className="text-white">{getTargetDisplay()}</strong>
                    . This cannot be revoked.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmBroadcast}
                      className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all ${isEmergency ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
                    >
                      Confirm & Send
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
