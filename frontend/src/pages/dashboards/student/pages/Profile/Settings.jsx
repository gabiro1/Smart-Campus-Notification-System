import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bell, Shield, Moon, Lock, Eye, EyeOff, Loader2, LogOut, Trash2, Mail, CheckCircle2, XCircle, 
  AlertTriangle, ChevronDown, User, Palette, Activity, Save, Check, ChevronRight 
} from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../../../../services/authService";
import apiClient from "../../../../../services/apiClient";
import { GlassCard } from "@/components/shared";
import { useTheme } from "../../../../../context/ThemeContext";

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Privacy", icon: Lock },
];

const THEMES = [
  { id: "light", label: "Light", icon: Activity, preview: "bg-white border border-gray-200" },
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-neutral-900 border border-neutral-700" },
];

export default function Settings() {
  const { isDarkMode, toggleTheme, setTheme, themePreference } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [settings, setSettings] = useState({
    theme: themePreference || "light",
    push: true,
    email: true,
    sms: false,
    digestEnabled: true,
    quietHoursEnabled: false,
    quietHours: { startTime: "22:00", endTime: "07:00" },
    profileVisibility: "students",
  });

  // Quiet Hours State
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHours, setQuietHours] = useState({ startTime: "22:00", endTime: "07:00" });
  
  // Password Change State
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Support Tickets State
  const [showSupportSection, setShowSupportSection] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'bug',
    subject: '',
    description: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadMyTickets();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateNotificationPreferences(settings);
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
    setTheme(themeId);
  };

  // Load my tickets
  const loadMyTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await supportService.getMyTickets();
      if (response.success) {
        setMyTickets(response.tickets || []);
      }
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Submit support ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      toast.error("Please fill in subject and description");
      return;
    }
    setSubmittingTicket(true);
    try {
      const response = await supportService.submitTicket(ticketForm);
      if (response.success) {
        toast.success("Ticket submitted successfully!");
        setTicketForm({ category: 'bug', subject: '', description: '' });
        loadMyTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.notificationPreferences) {
          setPreferences(data.user.notificationPreferences);
        }
        // Quiet Hours
        if (data.user.quietHours?.startTime && data.user.quietHours?.endTime) {
          setQuietHoursEnabled(true);
          setQuietHours({
            startTime: data.user.quietHours.startTime,
            endTime: data.user.quietHours.endTime
          });
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      await apiClient.put('/users/profile', {
        quietHours: quietHoursEnabled ? quietHours : { startTime: null, endTime: null },
        theme: settings.theme,
        themePreference: settings.theme,
      });
      toast.success("Settings updated!");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  // Save Quiet Hours
  const saveQuietHours = async () => {
    try {
      await apiClient.put('/users/profile', {
        quietHours: quietHoursEnabled ? quietHours : { startTime: null, endTime: null }
      });
      toast.success("Quiet hours updated!");
    } catch (error) {
      toast.error("Failed to update quiet hours");
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.put('/users/update', {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await apiClient.post('/users/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      toast.success("Logged out successfully!");
      window.location.href = '/login';
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }
    setDeleting(true);
    try {
      await apiClient.delete(`/users/profile/${user?._id}`, {
        data: { password: deletePassword }
      });
      toast.success("Account deleted");
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  // Resend Verification Email
  const handleResendVerification = async () => {
    try {
      await apiClient.post('/users/request-verification');
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };

  // Format last digest date
  const formatLastDigest = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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
        <p className="text-sm text-muted-foreground">Manage your account preferences and configurations</p>
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
                <h2 className="text-lg font-semibold text-foreground mb-6">Account</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 md:gap-6 p-4 bg-accent/50 rounded-xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl md:text-2xl shrink-0">
                      {user?.name?.charAt(0) || "S"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground truncate">{user?.name || "Student User"}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ') || "student"}</p>
                      <p className="text-sm text-blue-400 truncate">{user?.email || "student@uninotify.edu"}</p>
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
                        defaultValue={user?.role?.replace('_', ' ') || "Student"}
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
                      <p className="text-sm text-muted-foreground">Receive alerts on this device</p>
                    </div>
                    <button
                      onClick={() => handleToggle("push")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.push ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.push ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <button
                      onClick={() => handleToggle("email")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.email ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.email ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                    </div>
                    <button
                      onClick={() => handleToggle("sms")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.sms ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.sms ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Quiet Hours</h4>
                      <p className="text-sm text-muted-foreground">Pause non-critical notifications</p>
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
                    <div className="p-4 bg-accent/50 rounded-xl space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="text-xs text-muted-foreground w-16">Start:</label>
                        <input
                          type="time"
                          value={quietHours.startTime}
                          onChange={(e) => setQuietHours(prev => ({ ...prev, startTime: e.target.value }))}
                          className="bg-primary/10 border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-xs text-muted-foreground w-16">End:</label>
                        <input
                          type="time"
                          value={quietHours.endTime}
                          onChange={(e) => setQuietHours(prev => ({ ...prev, endTime: e.target.value }))}
                          className="bg-primary/10 border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Daily Digest</h4>
                      <p className="text-sm text-muted-foreground">AI summary delivered to email</p>
                    </div>
                    <button
                      onClick={() => handleToggle("digestEnabled")}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.digestEnabled ? "bg-blue-600" : "bg-accent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                        settings.digestEnabled ? "translate-x-7" : "translate-x-1"
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <h2 className="text-lg font-semibold text-foreground mb-6">Security</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/50 rounded-xl space-y-4">
                    <h4 className="font-medium text-foreground">Change Password</h4>
                    <div className="space-y-3">
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50"
                      />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50"
                      />
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showPasswords ? "Hide" : "Show"} passwords
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        disabled={changingPassword}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {changingPassword ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user?.emailVerified ? (
                          <CheckCircle2 size={20} className="text-emerald-400" />
                        ) : (
                          <XCircle size={20} className="text-red-400" />
                        )}
                        <div>
                          <h4 className="font-medium text-foreground">Email Verification</h4>
                          <p className="text-xs text-muted-foreground">
                            {user?.emailVerified ? "Verified" : "Not Verified"}
                          </p>
                        </div>
                      </div>
                      {!user?.emailVerified && (
                        <button
                          onClick={handleResendVerification}
                          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-foreground text-xs font-bold rounded-lg transition-colors"
                        >
                          Resend Email
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Log Out</h4>
                        <p className="text-xs text-muted-foreground">Sign out of this device</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/50 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Privacy</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-foreground">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently remove your account</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-foreground text-sm font-bold rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-red-500/30 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Delete Account</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full bg-primary/10 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/50 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="flex-1 py-3 border border-border text-muted-foreground rounded-xl font-bold text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-foreground rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
