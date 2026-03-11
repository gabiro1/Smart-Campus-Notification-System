import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  MessageSquare,
  Shield,
  Zap,
  Save,
  Activity,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import adminService from "../../../../services/adminService";
import toast, { Toaster } from "react-hot-toast";

export default function CoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings States
  const [smsQuota, setSmsQuota] = useState({ used: 0, limit: 10000 });
  const [configs, setConfigs] = useState({
    aiAutoApprove: false,
    aiStrictness: 75,
    requireHodApproval: true,
    maintenanceMode: false,
    maxBroadcastReach: "all",
  });

  // Fetch initial settings & SMS Quota
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Fetch SMS quota using your existing service
        const quotaData = await adminService.getSMSQuota();

        setSmsQuota({
          used: quotaData?.used || 4250, // Fallback dummy data for visualization
          limit: quotaData?.limit || 10000,
        });

        // In a full implementation, you'd fetch 'configs' from a GET /settings endpoint here
      } catch (error) {
        toast.error("Failed to load system settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving to backend (You'll map this to an updateSettings controller later)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("System configurations updated successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const smsPercentage = Math.min(
    (smsQuota.used / smsQuota.limit) * 100,
    100,
  ).toFixed(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Activity className="animate-spin text-blue-500" size={32} />
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          Loading Configurations...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12">
      <Toaster theme="dark" position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500" size={36} /> Core Settings
          </h1>
          <p className="text-neutral-500 mt-1">
            Configure integrations, AI behavior, and global security rules.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          {saving ? (
            <Activity size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: API & Integrations */}
        <div className="space-y-8 lg:col-span-2">
          {/* SMS Gateway Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D0D0D] border border-white/5 rounded-[24px] p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-neutral-300">
              <Smartphone size={22} className="text-green-500" /> SMS Gateway
              limits
            </h2>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                    Current Billing Cycle
                  </p>
                  <p className="text-3xl font-black tracking-tighter text-white">
                    {smsQuota.used.toLocaleString()}{" "}
                    <span className="text-sm text-neutral-500 font-medium">
                      / {smsQuota.limit.toLocaleString()} msgs
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xl font-black ${smsPercentage > 85 ? "text-red-500" : "text-green-500"}`}
                  >
                    {smsPercentage}%
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${smsPercentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full ${smsPercentage > 85 ? "bg-red-500" : "bg-green-500"}`}
                />
              </div>
              {smsPercentage > 85 && (
                <p className="text-xs text-red-400 mt-3 font-bold flex items-center gap-1">
                  <AlertTriangle size={14} /> Warning: Approaching monthly API
                  limits.
                </p>
              )}
            </div>
          </motion.div>

          {/* AI Engine Tuning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D0D0D] border border-white/5 rounded-[24px] p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-neutral-300">
              <Zap size={22} className="text-purple-500" /> AI Engine
              Configuration
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Gemini Auto-Approve
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Allow AI to auto-approve flyers that match strict safety
                    guidelines.
                  </p>
                </div>
                <ToggleSwitch
                  isOn={configs.aiAutoApprove}
                  onToggle={() =>
                    setConfigs({
                      ...configs,
                      aiAutoApprove: !configs.aiAutoApprove,
                    })
                  }
                />
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Content Filter Strictness
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      Adjust the AI OCR moderation threshold.
                    </p>
                  </div>
                  <span className="bg-purple-500/10 text-purple-400 font-bold px-3 py-1 rounded-lg text-sm border border-purple-500/20">
                    {configs.aiStrictness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={configs.aiStrictness}
                  onChange={(e) =>
                    setConfigs({
                      ...configs,
                      aiStrictness: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Security & Workflow */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0D0D0D] border border-white/5 rounded-[24px] p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-neutral-300">
              <Shield size={22} className="text-blue-500" /> Security & Workflow
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Require HoD Approval
                  </h4>
                  <ToggleSwitch
                    isOn={configs.requireHodApproval}
                    onToggle={() =>
                      setConfigs({
                        ...configs,
                        requireHodApproval: !configs.requireHodApproval,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Force lecturer broadcasts to pass through Department Head
                  approval.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Maintenance Mode
                  </h4>
                  <ToggleSwitch
                    isOn={configs.maintenanceMode}
                    onToggle={() =>
                      setConfigs({
                        ...configs,
                        maintenanceMode: !configs.maintenanceMode,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  Temporarily block non-admins from creating new events.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <h4 className="font-bold text-white text-sm">
                  Max Broadcast Reach
                </h4>
                <p className="text-xs text-neutral-500 mb-2">
                  Limit the maximum audience size for a single event.
                </p>
                <select
                  value={configs.maxBroadcastReach}
                  onChange={(e) =>
                    setConfigs({
                      ...configs,
                      maxBroadcastReach: e.target.value,
                    })
                  }
                  className="w-full bg-[#111] border border-white/5 rounded-xl py-3 px-4 focus:border-blue-500 outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="department">Department Level Only</option>
                  <option value="school">School Level Only</option>
                  <option value="all">Unrestricted (Entire Campus)</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Reusable Custom Toggle Switch Component
function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isOn ? "bg-blue-600" : "bg-neutral-700"}`}
      onClick={onToggle}
    >
      <motion.div
        className="bg-white w-4 h-4 rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        animate={{ x: isOn ? 24 : 0 }}
      />
    </div>
  );
}
