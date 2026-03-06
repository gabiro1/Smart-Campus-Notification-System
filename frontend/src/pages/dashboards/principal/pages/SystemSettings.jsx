import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Shield,
  Settings as SettingsIcon,
  BellRing,
  Save,
  Bot,
  Zap,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

// Principal-Themed Liquid Toggle
const LiquidToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${enabled ? "bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-black/50 border border-white/10"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("ai");

  // Simulated System States
  const [aiAutoTagging, setAiAutoTagging] = useState(true);
  const [aiSentimentAnalysis, setAiSentimentAnalysis] = useState(true);
  const [strictAuth, setStrictAuth] = useState(true);
  const [globalMute, setGlobalMute] = useState(false);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          System Configuration
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Manage core platform behavior, security protocols, and AI
          integrations.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Navigation Tabs */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          {[
            { id: "ai", label: "AI Configuration", icon: Bot },
            { id: "security", label: "Security & Access", icon: Shield },
            { id: "comms", label: "Global Policies", icon: Globe },
            { id: "integrations", label: "Integrations", icon: Zap },
            { id: "notifications", label: "System Alerts", icon: BellRing },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold ${
                activeTab === tab.id
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
              }`}
            >
              <tab.icon
                size={18}
                className={
                  activeTab === tab.id
                    ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : ""
                }
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "ai" && (
                <>
                  <GlassCard className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bot size={20} className="text-emerald-400" /> AI Engine
                        Parameters
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Configure how the UniCore AI processes university
                        communications.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between group">
                        <div className="pr-8">
                          <p className="text-white font-bold text-sm group-hover:text-emerald-100 transition-colors">
                            Auto-Categorization
                          </p>
                          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                            Allow AI to automatically tag and route messages
                            based on semantic content analysis.
                          </p>
                        </div>
                        <LiquidToggle
                          enabled={aiAutoTagging}
                          onChange={setAiAutoTagging}
                        />
                      </div>

                      <div className="flex items-center justify-between group">
                        <div className="pr-8">
                          <p className="text-white font-bold text-sm group-hover:text-emerald-100 transition-colors">
                            Sentiment & Urgency Flagging
                          </p>
                          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                            Automatically flag student messages showing high
                            distress or critical urgency for immediate HoD
                            review.
                          </p>
                        </div>
                        <LiquidToggle
                          enabled={aiSentimentAnalysis}
                          onChange={setAiSentimentAnalysis}
                        />
                      </div>
                    </div>
                  </GlassCard>
                </>
              )}

              {activeTab === "security" && (
                <GlassCard className="space-y-6 border-rose-500/20">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                      <Shield size={20} /> Zero-Trust Architecture
                    </h2>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="pr-8">
                      <p className="text-white font-bold text-sm">
                        Strict Role Authentication (2FA)
                      </p>
                      <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                        Require biometric or hardware key authentication for all
                        HoD, Dean, and Principal level actions.
                      </p>
                    </div>
                    <LiquidToggle
                      enabled={strictAuth}
                      onChange={setStrictAuth}
                    />
                  </div>
                </GlassCard>
              )}

              {activeTab === "comms" && (
                <GlassCard className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <Globe size={20} /> Network Overrides
                    </h2>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="pr-8">
                      <p className="text-white font-bold text-sm">
                        Global Mute (Students)
                      </p>
                      <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
                        Temporarily disable all student-to-student and
                        student-to-staff messaging during critical exams or
                        incidents.
                      </p>
                    </div>
                    <LiquidToggle
                      enabled={globalMute}
                      onChange={setGlobalMute}
                    />
                  </div>
                </GlassCard>
              )}

              <div className="flex justify-end pt-4 gap-3">
                <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10">
                  Discard
                </button>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 active:scale-95">
                  <Save size={16} /> Deploy Configuration
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
