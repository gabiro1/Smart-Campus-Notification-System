import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { Bell, Palette, Shield, Target } from "lucide-react";

export default function Settings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [autoTargeting, setAutoTargeting] = useState(true);

  // Custom Toggle Component to match the liquid aesthetic
  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "bg-white/10 border border-white/5"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Guild Settings
        </h1>
        <p className="text-neutral-400">
          Configure your dashboard and communication rules.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-4 space-y-2">
          {[
            {
              id: "notifications",
              label: "Notifications",
              icon: Bell,
              active: true,
            },
            {
              id: "targeting",
              label: "Student Targeting",
              icon: Target,
              active: false,
            },
            {
              id: "branding",
              label: "Guild Branding",
              icon: Palette,
              active: false,
            },
            { id: "security", label: "Security", icon: Shield, active: false },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                tab.active
                  ? "bg-white/[0.08] text-white shadow-lg border border-white/10"
                  : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200"
              }`}
            >
              <tab.icon
                size={18}
                className={tab.active ? "text-blue-400" : ""}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 space-y-6">
          <GlassCard className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Default Notifications
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Manage how the guild sends out broad alerts.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">
                    Push Notifications
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Send alerts directly to the student app.
                  </p>
                </div>
                <Toggle enabled={pushEnabled} onChange={setPushEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">
                    Email Fallback
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Send an email if push notification fails.
                  </p>
                </div>
                <Toggle enabled={emailEnabled} onChange={setEmailEnabled} />
              </div>
            </div>
          </GlassCard>

          <GlassCard delay={0.1} className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Smart Targeting
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">
                  Auto-Filter by Department
                </p>
                <p className="text-neutral-500 text-xs mt-1">
                  Automatically limit event visibility to relevant majors.
                </p>
              </div>
              <Toggle enabled={autoTargeting} onChange={setAutoTargeting} />
            </div>
          </GlassCard>

          <div className="flex justify-end gap-3 mt-8">
            <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:bg-white/5 transition-colors">
              Discard Changes
            </button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
