import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Lock,
  Save,
  Activity,
  Check,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Mail,
  MessageSquare,
  UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard } from "@/components/shared"; // Adjust path as needed
// Assume useAuth and useTheme exist in your architecture based on the reference
import { useAuth } from "../../../../context/AuthContext";
import { useTheme } from "../../../../context/ThemeContext";

const SETTINGS_TABS = [
  { id: "account", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "approvals", label: "Approvals", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Lock },
];

const THEMES = [
  { id: "light", label: "Light", icon: Sun, preview: "bg-white border border-gray-200" },
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-neutral-900 border border-neutral-700" },
  { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-neutral-900" },
];

export default function DepartmentSettings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    theme: "system",
    notificationsEnabled: true,
    emailNotifications: true,
    autoApproveCP: false,
    allowStudentBroadcast: false,
    requireApprovalForEvents: true,
  });

  // Load settings securely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hod_settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to parse settings:", error);
      toast.error("Failed to load local preferences.");
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API Call
      await new Promise((r) => setTimeout(r, 800));
      
      // Theme logic sync
      if (settings.theme === "dark" && !isDarkMode) toggleTheme();
      if (settings.theme === "light" && isDarkMode) toggleTheme();

      localStorage.setItem("hod_settings", JSON.stringify(settings));
      toast.success("Department settings optimized and saved.");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeSelect = (themeId) => {
    setSettings((prev) => ({ ...prev, theme: themeId }));
    if (themeId === "dark" && !isDarkMode) toggleTheme();
    if (themeId === "light" && isDarkMode) toggleTheme();
  };

  // Reusable Component for pristine, DRY code
  const SettingsToggle = ({ icon: Icon, iconColor, title, description, stateKey }) => (
    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg bg-${iconColor}-500/10`}>
          <Icon size={18} className={`text-${iconColor}-500`} />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => handleToggle(stateKey)}
        className={`relative w-14 h-8 rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          settings[stateKey] ? "bg-blue-600" : "bg-slate-600/50"
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
            settings[stateKey] ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 w-full max-w-6xl mx-auto text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Department Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage HOD preferences, approvals, and system parameters</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden lg:overflow-visible pb-2 lg:pb-0">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : ""} />
                  {tab.label}
                  {!isActive && <ChevronRight size={14} className="ml-auto opacity-50 lg:hidden" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* Profile Tab */}
              {activeTab === "account" && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">HOD Identity</h2>
                  <div className="flex items-center gap-6 p-5 bg-accent/30 rounded-2xl border border-border/50 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                      {user?.name?.charAt(0)?.toUpperCase() || "H"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{user?.name || "Head of Department"}</h3>
                      <p className="text-sm font-medium text-blue-500">Department of Information Technology</p>
                      <p className="text-sm text-muted-foreground mt-1">{user?.email || "hod.it@university.edu"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Display Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Contact Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Alert Preferences</h2>
                  <div className="space-y-3">
                    <SettingsToggle
                      icon={Bell}
                      iconColor="blue"
                      title="System Notifications"
                      description="Receive real-time system alerts within the dashboard"
                      stateKey="notificationsEnabled"
                    />
                    <SettingsToggle
                      icon={Mail}
                      iconColor="amber"
                      title="Email Digest"
                      description="Send a daily summary of pending approvals to your inbox"
                      stateKey="emailNotifications"
                    />
                  </div>
                </GlassCard>
              )}

              {/* Approvals Tab */}
              {activeTab === "approvals" && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Workflow Automation</h2>
                  <div className="space-y-3">
                    <SettingsToggle
                      icon={UserCheck}
                      iconColor="emerald"
                      title="Auto-Approve Class Reps"
                      description="Bypass manual verification for class representative assignments"
                      stateKey="autoApproveCP"
                    />
                    <SettingsToggle
                      icon={MessageSquare}
                      iconColor="purple"
                      title="Allow Student Broadcasts"
                      description="Permit system-wide announcements from verified student leaders"
                      stateKey="allowStudentBroadcast"
                    />
                    <SettingsToggle
                      icon={Shield}
                      iconColor="red"
                      title="Strict Event Moderation"
                      description="Require explicit HOD sign-off for all departmental events"
                      stateKey="requireApprovalForEvents"
                    />
                  </div>
                </GlassCard>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Interface Theme</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {THEMES.map((theme) => {
                      const Icon = theme.icon;
                      const isSelected = settings.theme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeSelect(theme.id)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/5"
                              : "border-border hover:border-blue-500/30"
                          }`}
                        >
                          <div className={`h-24 rounded-xl mb-4 ${theme.preview} flex items-center justify-center shadow-sm`}>
                            <Icon size={28} className={settings.theme === "dark" ? "text-white" : "text-neutral-900"} />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{theme.label}</p>
                          {isSelected && (
                            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-blue-500">
                              <Check size={14} /> Active
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Authentication</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full max-w-md bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full max-w-md bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <button className="px-6 py-2.5 bg-background border border-border hover:bg-accent text-foreground rounded-xl text-sm font-semibold transition-colors">
                      Update Password
                    </button>
                  </div>
                </GlassCard>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Global Save Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end mt-8 pt-6 border-t border-border/50"
          >
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? "Committing..." : "Save Configuration"}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}