import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Shield,
  Settings as SettingsIcon,
  BellRing,
  Save,
  Building2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Dean-Themed Liquid Toggle (Blue Accent)
const LiquidToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
      enabled
        ? "bg-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-500/50"
        : "bg-black/50 border border-white/10"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

export default function SchoolSettings() {
  const [activeTab, setActiveTab] = useState("policies");

  // Simulated School-Level States
  const [enforceApprovals, setEnforceApprovals] = useState(true);
  const [allowCrossDept, setAllowCrossDept] = useState(false);
  const [enforceQuietHours, setEnforceQuietHours] = useState(true);
  const [maxDailyBroadcasts, setMaxDailyBroadcasts] = useState("3");

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          School Settings
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Configure communication policies and workflows for all departments
          within your School.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Navigation Tabs */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          {[
            { id: "policies", label: "Announcement Policies", icon: Shield },
            { id: "departments", label: "Department Limits", icon: Building2 },
            {
              id: "notifications",
              label: "Notification Rules",
              icon: BellRing,
            },
            {
              id: "workflows",
              label: "Approval Workflows",
              icon: SettingsIcon,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold ${
                activeTab === tab.id
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
              }`}
            >
              <tab.icon
                size={18}
                className={
                  activeTab === tab.id
                    ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    : ""
                }
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* POLICIES TAB */}
              {activeTab === "policies" && (
                <>
                  <GlassCard className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield size={20} className="text-blue-400" />{" "}
                        School-Wide Policies
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        These settings apply to all Heads of Department (HoDs)
                        and Lecturers under your jurisdiction.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between group">
                        <div className="pr-8">
                          <p className="text-white font-bold text-sm group-hover:text-blue-100 transition-colors">
                            Strict HoD Approvals
                          </p>
                          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                            Require all Lecturer announcements to be approved by
                            their respective HoD before distribution to
                            students.
                          </p>
                        </div>
                        <LiquidToggle
                          enabled={enforceApprovals}
                          onChange={setEnforceApprovals}
                        />
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="pr-8">
                          <p className="text-white font-bold text-sm group-hover:text-blue-100 transition-colors">
                            Cross-Department Messaging
                          </p>
                          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                            Allow HoDs to send broadcasts to students in other
                            departments within this School (e.g., CS HoD
                            messaging IT students).
                          </p>
                        </div>
                        <LiquidToggle
                          enabled={allowCrossDept}
                          onChange={setAllowCrossDept}
                        />
                      </div>
                    </div>
                  </GlassCard>
                </>
              )}

              {/* DEPARTMENT LIMITS TAB */}
              {activeTab === "departments" && (
                <GlassCard className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Building2 size={20} className="text-purple-400" />{" "}
                      Department Rate Limits
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">
                      Prevent student notification fatigue by limiting
                      department volume.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="pr-8">
                      <p className="text-white font-bold text-sm">
                        Max Daily Broadcasts per Department
                      </p>
                      <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                        Limit how many "Standard" priority announcements a
                        single department can send per day. (Emergency alerts
                        bypass this limit).
                      </p>
                    </div>
                    <select
                      value={maxDailyBroadcasts}
                      onChange={(e) => setMaxDailyBroadcasts(e.target.value)}
                      className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="1">1 Broadcast</option>
                      <option value="3">3 Broadcasts</option>
                      <option value="5">5 Broadcasts</option>
                      <option value="Unlimited">Unlimited</option>
                    </select>
                  </div>
                </GlassCard>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <GlassCard className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock size={20} className="text-amber-400" /> Quiet Hours
                    </h2>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="pr-8">
                      <p className="text-white font-bold text-sm">
                        Enforce School Quiet Hours
                      </p>
                      <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                        Automatically mute non-emergency notifications for
                        students between 22:00 and 06:00. Messages will be
                        queued for morning delivery.
                      </p>
                    </div>
                    <LiquidToggle
                      enabled={enforceQuietHours}
                      onChange={setEnforceQuietHours}
                    />
                  </div>
                </GlassCard>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 gap-3">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10">
                  Discard Changes
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 active:scale-95">
                  <Save size={16} /> Save School Policies
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
