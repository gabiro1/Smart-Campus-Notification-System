import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Zap,
  Bell,
  Palette,
  User,
  Globe,
  Monitor,
  Moon,
  Sun,
  Save,
  Activity,
  Check,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import adminService from "../../../../services/adminService";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import toast from "react-hot-toast";

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI Engine", icon: Zap },
];

const THEMES = [
  { id: "light", label: "Light", icon: Sun, preview: "bg-white border border-gray-200" },
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-neutral-900 border border-neutral-700" },
  { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-neutral-900" },
];

export default function CoreSettings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    theme: "system",
    aiAutoApprove: false,
    aiStrictness: 75,
    requireHodApproval: true,
    requireDeanApproval: true,
    maintenanceMode: false,
    allowGuestBroadcast: false,
    maxBroadcastFrequency: 5,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    allowStudentCreateEvent: true,
    requireEventApproval: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await adminService.getSettings();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
          if (data.theme === "light" || data.theme === "dark" || data.theme === "system") {
            if (data.theme === "dark" && !isDarkMode) {
              toggleTheme();
            } else if (data.theme === "light" && isDarkMode) {
              toggleTheme();
            }
          }
        }
      } catch {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      
      if (settings.theme === "dark" && !isDarkMode) {
        toggleTheme();
      } else if (settings.theme === "light" && isDarkMode) {
        toggleTheme();
      }
      
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeSelect = (themeId) => {
    setSettings(prev => ({ ...prev, theme: themeId }));
    if (themeId === "dark") {
      if (!isDarkMode) toggleTheme();
    } else if (themeId === "light") {
      if (isDarkMode) toggleTheme();
    }
  };

  if (loading) {
    return (
      <div className="h-full min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Activity className="animate-spin text-blue-500" size={32} />
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your system preferences and configurations</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical Navigation Sidebar */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden [&::-ms-scrollbar]:hidden lg:overflow-visible">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {!isActive && <ChevronRight size={14} className="ml-auto lg:hidden" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Admin Account</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 md:gap-6 p-4 bg-accent/50 rounded-xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl md:text-2xl shrink-0">
                      {user?.name?.charAt(0) || "A"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground truncate">{user?.name || "Admin User"}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ') || "Administrator"}</p>
                      <p className="text-sm text-blue-400 truncate">{user?.email || "admin@uninotify.edu"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={user?.phoneNumber || ""}
                        placeholder="+1234567890"
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Role</label>
                      <input
                        type="text"
                        defaultValue={user?.role?.replace('_', ' ') || "Administrator"}
                        disabled
                        className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 text-muted-foreground cursor-not-allowed capitalize"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                      <Save size={18} /> Update Profile
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Maintenance Mode</h4>
                      <p className="text-sm text-muted-foreground">Put the system in maintenance mode</p>
                    </div>
                    <button
                      onClick={() => handleToggle("maintenanceMode")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.maintenanceMode ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Allow Student Create Event</h4>
                      <p className="text-sm text-muted-foreground">Students can create events</p>
                    </div>
                    <button
                      onClick={() => handleToggle("allowStudentCreateEvent")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.allowStudentCreateEvent ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.allowStudentCreateEvent ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Require Event Approval</h4>
                      <p className="text-sm text-muted-foreground">Events need admin approval before publishing</p>
                    </div>
                    <button
                      onClick={() => handleToggle("requireEventApproval")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.requireEventApproval ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.requireEventApproval ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Require HoD Approval</h4>
                      <p className="text-sm text-muted-foreground">Lecturer broadcasts need HoD approval</p>
                    </div>
                    <button
                      onClick={() => handleToggle("requireHodApproval")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.requireHodApproval ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.requireHodApproval ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Require Dean Approval</h4>
                      <p className="text-sm text-muted-foreground">HoD broadcasts need Dean approval</p>
                    </div>
                    <button
                      onClick={() => handleToggle("requireDeanApproval")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.requireDeanApproval ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.requireDeanApproval ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Allow Guest Broadcast</h4>
                      <p className="text-sm text-muted-foreground">Unregistered users can broadcast</p>
                    </div>
                    <button
                      onClick={() => handleToggle("allowGuestBroadcast")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.allowGuestBroadcast ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.allowGuestBroadcast ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">Max Broadcast Frequency</h4>
                        <p className="text-sm text-muted-foreground">Broadcasts per day limit</p>
                      </div>
                      <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 font-bold rounded-lg">
                        {settings.maxBroadcastFrequency}/day
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={settings.maxBroadcastFrequency}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxBroadcastFrequency: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
                <p className="text-sm text-muted-foreground mb-6">Choose your preferred theme</p>
                
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
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-border hover:border-blue-500/50"
                        }`}
                      >
                        <div className={`h-20 rounded-xl mb-3 ${theme.preview} flex items-center justify-center`}>
                          <Icon size={24} className={settings.theme === "dark" ? "text-white" : "text-neutral-900"} />
                        </div>
                        <p className="text-sm font-medium text-foreground">{theme.label}</p>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
                            <Check size={12} /> Active
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Require HoD Approval</h4>
                      <p className="text-sm text-muted-foreground">Force lecturer broadcasts through HoD</p>
                    </div>
                    <button
                      onClick={() => handleToggle("requireHodApproval")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.requireHodApproval ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.requireHodApproval ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Maintenance Mode</h4>
                      <p className="text-sm text-muted-foreground">Restrict access during updates</p>
                    </div>
                    <button
                      onClick={() => handleToggle("maintenanceMode")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.maintenanceMode ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => handleToggle("emailNotifications")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.emailNotifications ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.emailNotifications ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <button
                      onClick={() => handleToggle("pushNotifications")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.pushNotifications ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.pushNotifications ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                    </div>
                    <button
                      onClick={() => handleToggle("smsNotifications")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.smsNotifications ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.smsNotifications ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">AI Engine Configuration</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Gemini Auto-Approve</h4>
                      <p className="text-sm text-muted-foreground">AI approves safe flyers automatically</p>
                    </div>
                    <button
                      onClick={() => handleToggle("aiAutoApprove")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.aiAutoApprove ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.aiAutoApprove ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-foreground">Content Filter Strictness</h4>
                        <p className="text-sm text-muted-foreground">AI moderation threshold</p>
                      </div>
                      <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 font-bold rounded-lg">
                        {settings.aiStrictness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.aiStrictness}
                      onChange={(e) => setSettings(prev => ({ ...prev, aiStrictness: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Integrations</h2>
                <div className="text-center py-12">
                  <Database size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Integrations Connected</h3>
                  <p className="text-sm text-muted-foreground">Connect external services to enhance functionality</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}