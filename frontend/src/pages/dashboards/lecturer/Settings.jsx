import { useState } from "react";
import GlassCard from "./components/GlassCard";
import { User, Bell, FileText, Shield, Save } from "lucide-react";

// Custom Liquid Toggle Switch
const LiquidToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${
      enabled
        ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/50"
        : "bg-black/50 border border-white/10 hover:border-white/20"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [studentReplies, setStudentReplies] = useState(false);
  const [autoArchive, setAutoArchive] = useState(true);

  const tabs = [
    { id: "account", label: "Account Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Preferences
        </h1>
        <p className="text-neutral-400">
          Manage your account settings and default announcement behaviors.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Settings Navigation */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] font-medium"
                }`}
              >
                <tab.icon
                  size={18}
                  className={
                    isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""
                  }
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* Section 1: Personal Info */}
          <GlassCard className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Personal Information
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Update your display name and contact details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Dr. Sarah Jenkins"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Department
                </label>
                <input
                  type="text"
                  defaultValue="Computer Science"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-neutral-500 focus:outline-none cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Communication Preferences */}
          <GlassCard delay={0.1} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Communication Rules
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Control how announcements behave by default.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-blue-100 transition-colors">
                    Email Delivery Copy
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Always send a copy of announcements to your own email.
                  </p>
                </div>
                <LiquidToggle enabled={emailAlerts} onChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-blue-100 transition-colors">
                    Allow Student Replies
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Let students reply directly to your broadcasted messages.
                  </p>
                </div>
                <LiquidToggle
                  enabled={studentReplies}
                  onChange={setStudentReplies}
                />
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-blue-100 transition-colors">
                    Auto-Archive Old Messages
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Move announcements to archive after 30 days automatically.
                  </p>
                </div>
                <LiquidToggle enabled={autoArchive} onChange={setAutoArchive} />
              </div>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10">
              Discard Changes
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 active:scale-95">
              <Save size={16} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
