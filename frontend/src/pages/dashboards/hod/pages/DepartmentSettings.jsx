import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { Shield, Settings as SettingsIcon, BellRing, Save } from "lucide-react";

// Liquid Toggle component reused from earlier
const LiquidToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${enabled ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "bg-black/50 border border-white/10"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

export default function DepartmentSettings() {
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowReplies, setAllowReplies] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Settings
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Configure global policies for department communications.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Navigation (Optional, keeping it simple for HoD) */}
        <div className="md:col-span-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm">
            <Shield size={18} /> Workflow Rules
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] rounded-xl transition-all text-sm font-medium">
            <BellRing size={18} /> Default Policies
          </button>
        </div>

        {/* Right Side Settings Area */}
        <div className="md:col-span-8 space-y-6">
          <GlassCard className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Approval Workflow
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Manage how announcements go live.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-white font-medium text-sm">
                    Require HoD Approval
                  </p>
                  <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                    All lecturer announcements must be approved by the HoD
                    before being sent to students.
                  </p>
                </div>
                <LiquidToggle
                  enabled={requireApproval}
                  onChange={setRequireApproval}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard delay={0.1} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Communication Policies
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="text-white font-medium text-sm">
                  Allow Student Replies to Broadcasts
                </p>
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                  If enabled, students can reply directly to HoD official
                  broadcasts.
                </p>
              </div>
              <LiquidToggle enabled={allowReplies} onChange={setAllowReplies} />
            </div>
          </GlassCard>

          <div className="flex justify-end pt-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
