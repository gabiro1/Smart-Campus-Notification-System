import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Palette,
  Shield,
  Sliders,
  Save,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
  Activity,
  Clock,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Building2,
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import { useAuth } from "../../../../context/AuthContext";
import { useTheme } from "../../../../context/ThemeContext";
import authService from "../../../../services/authService";
import toast from "react-hot-toast";

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "security", label: "Security", icon: Shield },
];

const THEMES = [
  { id: "light", label: "Light", icon: Sun, preview: "bg-white border border-gray-200" },
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-neutral-900 border border-neutral-700" },
  { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-neutral-900" },
];

export default function RegistrarSettings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    theme: "system",
    emailNotifications: true,
    newRegistrationAlerts: true,
    enrollmentChangeAlerts: true,
    suspensionAlerts: true,
    eventAlerts: true,
    defaultAcademicYear: "2025/2026",
    defaultSemester: "First Semester",
    pageSize: "50",
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
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
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeSelect = (themeId) => {
    setSettings((prev) => ({ ...prev, theme: themeId }));
    if (themeId === "dark") {
      if (!isDarkMode) toggleTheme();
    } else if (themeId === "light") {
      if (isDarkMode) toggleTheme();
    }
  };

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your registrar account and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden lg:overflow-visible">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-600 text-white"
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

        <div className="flex-1 space-y-6">
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Registrar Profile</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 md:gap-6 p-4 bg-accent/50 rounded-xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl md:text-2xl shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() || "R"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground truncate">{user?.name || "Registrar"}</h3>
                      <p className="text-sm text-muted-foreground">Registrar</p>
                      <p className="text-sm text-emerald-400 truncate">{user?.email || ""}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || user?.phoneNumber || ""}
                        placeholder="+1234567890"
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Office / Department</label>
                      <input
                        type="text"
                        defaultValue={user?.department || "Academic Affairs"}
                        placeholder="Registrar's Office"
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                      <Save size={18} /> Update Profile
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
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-emerald-400" />
                      <div>
                        <h4 className="font-medium text-foreground">New Student Registration</h4>
                        <p className="text-sm text-muted-foreground">When a new student is registered in the system</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle("newRegistrationAlerts")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.newRegistrationAlerts ? "bg-emerald-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.newRegistrationAlerts ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className="text-blue-400" />
                      <div>
                        <h4 className="font-medium text-foreground">Enrollment Changes</h4>
                        <p className="text-sm text-muted-foreground">When students enroll or withdraw from programs</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle("enrollmentChangeAlerts")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.enrollmentChangeAlerts ? "bg-emerald-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.enrollmentChangeAlerts ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-red-400" />
                      <div>
                        <h4 className="font-medium text-foreground">Suspension Alerts</h4>
                        <p className="text-sm text-muted-foreground">When a student account is suspended or reinstated</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle("suspensionAlerts")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.suspensionAlerts ? "bg-emerald-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.suspensionAlerts ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-purple-400" />
                      <div>
                        <h4 className="font-medium text-foreground">Event Notifications</h4>
                        <p className="text-sm text-muted-foreground">Updates about campus events and academic calendar changes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle("eventAlerts")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.eventAlerts ? "bg-emerald-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.eventAlerts ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-amber-400" />
                      <div>
                        <h4 className="font-medium text-foreground">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive email updates for all registrar alerts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle("emailNotifications")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.emailNotifications ? "bg-emerald-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.emailNotifications ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
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
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border hover:border-emerald-500/50"
                        }`}
                      >
                        <div className={`h-20 rounded-xl mb-3 ${theme.preview} flex items-center justify-center`}>
                          <Icon size={24} className={settings.theme === "dark" ? "text-white" : "text-neutral-900"} />
                        </div>
                        <p className="text-sm font-medium text-foreground">{theme.label}</p>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
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

          {activeTab === "preferences" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Registrar Preferences</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase mb-1.5 block">Default Academic Year</label>
                      <select
                        value={settings.defaultAcademicYear}
                        onChange={(e) => setSettings((prev) => ({ ...prev, defaultAcademicYear: e.target.value }))}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>2024/2025</option>
                        <option>2025/2026</option>
                        <option>2026/2027</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase mb-1.5 block">Default Semester</label>
                      <select
                        value={settings.defaultSemester}
                        onChange={(e) => setSettings((prev) => ({ ...prev, defaultSemester: e.target.value }))}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>First Semester</option>
                        <option>Second Semester</option>
                        <option>Summer Session</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase mb-1.5 block">Records Per Page</label>
                      <select
                        value={settings.pageSize}
                        onChange={(e) => setSettings((prev) => ({ ...prev, pageSize: e.target.value }))}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      >
                        <option>25</option>
                        <option>50</option>
                        <option>100</option>
                        <option>200</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-4">Quiet Hours</h4>
                    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-emerald-400" />
                        <div>
                          <h4 className="font-medium text-foreground">Mute Notifications</h4>
                          <p className="text-sm text-muted-foreground">Silence non-critical alerts during specific hours</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("quietHoursEnabled")}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          settings.quietHoursEnabled ? "bg-emerald-600" : "bg-accent"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                          settings.quietHoursEnabled ? "translate-x-7" : "translate-x-1"
                        }`} />
                      </button>
                    </div>

                    {settings.quietHoursEnabled && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-xl mt-3">
                        <div>
                          <label className="text-xs text-muted-foreground uppercase mb-1.5 block">Start Time</label>
                          <input
                            type="time"
                            value={settings.quietHoursStart}
                            onChange={(e) => setSettings((prev) => ({ ...prev, quietHoursStart: e.target.value }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase mb-1.5 block">End Time</label>
                          <input
                            type="time"
                            value={settings.quietHoursEnd}
                            onChange={(e) => setSettings((prev) => ({ ...prev, quietHoursEnd: e.target.value }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
                <h2 className="text-lg font-semibold text-foreground mb-6">Security</h2>
                <div className="space-y-6">
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">Current Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-xs text-muted-foreground uppercase">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                      <Save size={18} /> Update Password
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
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
