import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Palette,
  Shield,
  Sliders,
  Heart,
  Save,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
  Activity,
  Clock,
  BookOpen,
  Code,
  Trophy,
  Music,
  Globe,
  Zap,
  Flame,
  Plus,
  X,
} from "lucide-react";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import { useAuth } from "../../../../../context/AuthContext";
import { useTheme } from "../../../../../context/ThemeContext";
import authService from "../../../../../services/authService";
import eventService from "../../../../../services/eventService";
import toast from "react-hot-toast";

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "interests", label: "Interests", icon: Heart },
  { id: "security", label: "Security", icon: Shield },
  { id: "preferences", label: "Preferences", icon: Sliders },
];

const INTEREST_OPTIONS = [
  { id: "academics", label: "Academics", icon: BookOpen, color: "blue" },
  { id: "technology", label: "Technology", icon: Code, color: "purple" },
  { id: "sports", label: "Sports", icon: Trophy, color: "orange" },
  { id: "events", label: "Events", icon: Flame, color: "pink" },
  { id: "music", label: "Music", icon: Music, color: "green" },
  { id: "arts", label: "Arts", icon: Palette, color: "yellow" },
  { id: "international", label: "International", icon: Globe, color: "cyan" },
  { id: "career", label: "Career", icon: Zap, color: "indigo" },
];

const THEMES = [
  { id: "light", label: "Light", icon: Sun, preview: "bg-white border border-gray-200" },
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-neutral-900 border border-neutral-700" },
  { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-neutral-900" },
];

export default function StudentSettings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState(
    Array.isArray(user?.interests) ? user.interests.map((i) => i.toLowerCase()) : []
  );

  const [customInterest, setCustomInterest] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    eventService.getAvailableTags().then((res) => {
      if (res?.tags) setAvailableTags(res.tags);
    }).catch(() => {});
  }, []);

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId));
    } else {
      if (selectedInterests.length >= 3) {
        toast.error("You can select up to 3 interests");
        return;
      }
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const addCustomInterest = () => {
    const tag = customInterest.trim().toLowerCase();
    if (!tag) return;
    if (selectedInterests.includes(tag)) {
      toast.error("Interest already added");
      return;
    }
    if (selectedInterests.length >= 3) {
      toast.error("You can select up to 3 interests");
      return;
    }
    setSelectedInterests([...selectedInterests, tag]);
    setCustomInterest("");
  };

  const [settings, setSettings] = useState({
    theme: "system",
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    announcementAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({ interests: selectedInterests });
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

  const registrationNumber = user?.registrationNumber || "";

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical Navigation Sidebar */}
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
                <h2 className="text-lg font-semibold text-foreground mb-6">Student Account</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 md:gap-6 p-4 bg-accent/50 rounded-xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl md:text-2xl shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground truncate">{user?.name || "Student"}</h3>
                      <p className="text-sm text-muted-foreground">{registrationNumber}</p>
                      <p className="text-sm text-blue-400 truncate">{user?.email || ""}</p>
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
                        defaultValue={user?.phone || user?.phoneNumber || ""}
                        placeholder="+1234567890"
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Registration Number</label>
                      <input
                        type="text"
                        defaultValue={registrationNumber}
                        disabled
                        className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 text-muted-foreground cursor-not-allowed"
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
                      <h4 className="font-medium text-foreground">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
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
                      <h4 className="font-medium text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
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

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Event Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming events</p>
                    </div>
                    <button
                      onClick={() => handleToggle("eventReminders")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.eventReminders ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.eventReminders ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Announcement Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified when new announcements are posted</p>
                    </div>
                    <button
                      onClick={() => handleToggle("announcementAlerts")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.announcementAlerts ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.announcementAlerts ? "translate-x-7" : "translate-x-1"
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

          {activeTab === "interests" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Your Interests</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose up to <span className="text-foreground font-medium">3 interests</span> to personalize your event feed and notifications. The AI engine ranks events higher when they match your interests.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    const Icon = interest.icon;
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-border hover:border-muted bg-background"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon
                            size={24}
                            className={isSelected ? "text-blue-500" : "text-muted-foreground"}
                          />
                          <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {interest.label}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mb-6 p-4 bg-accent/50 rounded-xl">
                  <label className="text-xs text-muted-foreground uppercase font-medium mb-2 block">
                    Custom Interest
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                      placeholder="e.g., AI, Robotics, Hackathons..."
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={addCustomInterest}
                      disabled={!customInterest.trim() || selectedInterests.length >= 3}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {selectedInterests.length > 0 && (
                  <div className="mb-6">
                    <label className="text-xs text-muted-foreground uppercase font-medium mb-2 block">
                      Selected Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((interest) => {
                        const predefined = INTEREST_OPTIONS.find((o) => o.id === interest);
                        return (
                          <div
                            key={interest}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
                          >
                            {predefined && <predefined.icon size={14} className="text-blue-400" />}
                            <span className="text-xs font-medium text-foreground capitalize">{interest}</span>
                            <button
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableTags.length > 0 && (
                  <div className="mb-6">
                    <label className="text-xs text-muted-foreground uppercase font-medium mb-2 block">
                      Suggested from Events
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Tags found in campus events. Click to add any that interest you.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter((t) => !selectedInterests.includes(t.name.toLowerCase()))
                        .slice(0, 12)
                        .map((tag) => (
                          <button
                            key={tag.name}
                            type="button"
                            onClick={() => toggleInterest(tag.name.toLowerCase())}
                            disabled={selectedInterests.length >= 3}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/50 border border-border hover:bg-accent hover:border-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
                          >
                            <span className="text-xs font-medium text-muted-foreground capitalize">{tag.name}</span>
                            <span className="text-[10px] text-muted-foreground/50">{tag.count} event{tag.count > 1 ? "s" : ""}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedInterests.length}/3 interests selected
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedInterests.length === 0
                        ? "Select at least one interest to personalize your feed"
                        : "Events matching your interests will appear at the top of your feed"}
                    </p>
                  </div>
                  <Heart size={20} className={selectedInterests.length > 0 ? "text-blue-500" : "text-muted-foreground"} />
                </div>

                {user?.interestWeights && Object.keys(user.interestWeights).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">Learned Preferences</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Based on your interactions with events, the AI has learned these preferences:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(user.interestWeights)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 6)
                        .map(([tag, weight]) => (
                          <div
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/50 border border-border"
                          >
                            <span className="text-xs font-medium text-foreground capitalize">{tag}</span>
                            <span className="text-[10px] text-blue-400 font-semibold">
                              {weight > 0 ? "+" : ""}{weight.toFixed(1)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
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
                    <div className="mt-4">
                      <label className="text-xs text-muted-foreground uppercase">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                      <Save size={18} /> Update Password
                    </button>
                  </div>
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
                <h2 className="text-lg font-semibold text-foreground mb-6">Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-blue-400" />
                      <div>
                        <h4 className="font-medium text-foreground">Quiet Hours</h4>
                        <p className="text-sm text-muted-foreground">Mute notifications during specific hours</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle("quietHoursEnabled")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.quietHoursEnabled ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.quietHoursEnabled ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  {settings.quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-xl">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase mb-1.5 block">Start Time</label>
                        <input
                          type="time"
                          value={settings.quietHoursStart}
                          onChange={(e) => setSettings((prev) => ({ ...prev, quietHoursStart: e.target.value }))}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase mb-1.5 block">End Time</label>
                        <input
                          type="time"
                          value={settings.quietHoursEnd}
                          onChange={(e) => setSettings((prev) => ({ ...prev, quietHoursEnd: e.target.value }))}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  )}
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
