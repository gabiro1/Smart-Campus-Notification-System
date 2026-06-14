import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Palette, Sun, Moon, Monitor,
  Loader2, Save, Camera, Eye, EyeOff, Check, AlertCircle
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import authService from "../../../../services/authService";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import toast from "react-hot-toast";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function LecturerSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    announcements: true,
    questions: true,
    replies: true,
    classUpdates: true,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setBio(user.bio || "");
      if (user.notificationPreferences) {
        setNotifSettings({ ...notifSettings, ...user.notificationPreferences });
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (name !== user?.name) formData.append("name", name);
      if (phone !== user?.phone) formData.append("phone", phone);
      if (bio !== user?.bio) formData.append("bio", bio);
      if (email !== user?.email) formData.append("email", email);
      if (avatar) formData.append("avatar", avatar);
      await authService.updateProfile(formData);
      if (refreshUser) await refreshUser();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPw(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  const handleThemeToggle = (t) => {
    setTheme(t);
    toast.success(`Theme changed to ${t}`);
  };

  const handleNotifToggle = async (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    try {
      await authService.updateNotificationPreferences(updated);
    } catch {
      setNotifSettings(notifSettings);
      toast.error("Failed to update preferences");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, preferences, and appearance</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 shrink-0">
          <div className="flex md:flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <GlassCard padding="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {avatar || user?.avatar ? (
                      <img src={avatar ? URL.createObjectURL(avatar) : user.avatar} alt=""
                        className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center">
                        <User size={24} className="text-blue-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors border-2 border-card">
                      <Camera size={10} className="text-white" />
                      <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user?.name || "Lecturer"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Phone</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Department</label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} disabled
                      className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors resize-none" />
                </div>
              </GlassCard>
              <div className="flex justify-end">
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "appearance" && (
            <GlassCard padding="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Theme Preference</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Light", icon: Sun, desc: "Always light mode" },
                  { id: "dark", label: "Dark", icon: Moon, desc: "Always dark mode" },
                  { id: "system", label: "System", icon: Monitor, desc: "Follow system preference" },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isActive = theme === opt.id;
                  return (
                    <button key={opt.id} onClick={() => handleThemeToggle(opt.id)}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${isActive ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-blue-500/30 bg-accent/30"}`}>
                      <Icon size={22} className={isActive ? "text-blue-400" : "text-muted-foreground"} />
                      <p className={`text-sm font-medium mt-3 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{opt.desc}</p>
                      {isActive && <Check size={14} className="text-blue-400 mt-2" />}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {activeTab === "notifications" && (
            <GlassCard padding="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "push", label: "Push Notifications", desc: "Receive push notifications in browser" },
                  { key: "announcements", label: "Announcement Updates", desc: "When your announcements are approved/rejected" },
                  { key: "questions", label: "New Questions", desc: "When students ask questions on your announcements" },
                  { key: "replies", label: "Reply Follow-ups", desc: "When students reply to your answers" },
                  { key: "classUpdates", label: "Class Updates", desc: "Changes to class schedules or materials" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button onClick={() => handleNotifToggle(item.key)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${notifSettings[item.key] ? "bg-blue-600" : "bg-border"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifSettings[item.key] ? "left-5.5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === "security" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <GlassCard padding="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> Passwords do not match</p>
                    )}
                  </div>
                </div>
              </GlassCard>
              <div className="flex justify-end">
                <button type="submit" disabled={changingPw || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
                  {changingPw ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                  {changingPw ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
