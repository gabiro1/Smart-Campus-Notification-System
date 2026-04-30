import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Shield, Moon, Lock, Eye, EyeOff, Loader2, LogOut, Trash2, Mail, CheckCircle2, XCircle,
  AlertTriangle, ChevronRight, User, Palette, Activity, Save, Check, Hash, Plus, X,
  Globe, Camera, Ticket, GraduationCap, Building, Building2, BookOpen, Clock, Calendar, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../../../../services/authService";
import apiClient from "../../../../../services/apiClient";
import { useTheme } from "../../../../../context/ThemeContext";

const SETTINGS_TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Palette },
  { id: "appearance", label: "Appearance", icon: Activity },
  { id: "security", icon: Shield, label: "Security" },
  { id: "privacy", icon: Lock, label: "Privacy" },
];

const THEMES = [
  { id: "light", label: "Light", preview: "bg-white border border-gray-200" },
  { id: "dark", label: "Dark", preview: "bg-neutral-900 border border-neutral-700" },
];

const NOTIFICATION_CATEGORIES = [
  { id: "events", label: "Events", description: "Event notifications and updates" },
  { id: "reminders", label: "Reminders", description: "Personal reminders and deadlines" },
  { id: "governance", label: "Governance", description: "University announcements and policies" },
];

export default function Settings() {
  const { isDarkMode, toggleTheme, setTheme, themePreference } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [settings, setSettings] = useState({
    theme: themePreference || "light",
    push: true,
    email: true,
    sms: false,
    digestEnabled: true,
    quietHoursEnabled: false,
    quietHours: { startTime: "22:00", endTime: "07:00" },
    profileVisibility: "students",
    languagePreference: "en",
    notificationCategories: {
      events: { push: true, email: true, sms: false },
      reminders: { push: true, email: true, sms: false },
      governance: { push: true, email: true, sms: false },
    },
  });

  const [quietHours, setQuietHours] = useState({ startTime: "22:00", endTime: "07:00" });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phoneNumber: ""
  });

  const [isEditing, setIsEditing] = useState(false);

  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRefName = (refObj) => {
    if (!refObj) return 'Not assigned';
    if (typeof refObj === 'object' && refObj.name) return refObj.name;
    if (typeof refObj === 'string' && refObj.length > 0) return 'Not assigned';
    return 'Not assigned';
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      // response = { success: true, data: user } from authService
      const userData = response.data || response;
      console.log("Loaded user data:", userData);
      if (userData && (userData.name || userData.email)) {
        setUser(userData);
        setProfileForm({
          name: userData.name || "",
          phoneNumber: userData.phoneNumber || ""
        });
        setInterests(userData.interests || []);

        if (userData.notificationPreferences) {
          const np = userData.notificationPreferences;
          setSettings(prev => ({
            ...prev,
            push: np.push ?? true,
            email: np.email ?? true,
            sms: np.sms ?? false,
            notificationCategories: np.categories || {
              events: { push: true, email: true, sms: false },
              reminders: { push: true, email: true, sms: false },
              governance: { push: true, email: true, sms: false },
            },
          }));
        }

        if (userData.languagePreference) {
          setSettings(prev => ({ ...prev, languagePreference: userData.languagePreference }));
        }

        if (userData.quietHours?.startTime && userData.quietHours?.endTime) {
          setQuietHoursEnabled(true);
          setQuietHours({
            startTime: userData.quietHours.startTime,
            endTime: userData.quietHours.endTime
          });
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber,
        interests: interests,
        languagePreference: settings.languagePreference,
      });

      await authService.updateNotificationPreferences({
        push: settings.push,
        email: settings.email,
        sms: settings.sms,
        categories: settings.notificationCategories,
      });

      await apiClient.put('/users/profile', {
        quietHours: quietHoursEnabled ? quietHours : { startTime: null, endTime: null }
      });

      if (settings.theme === "dark" && !isDarkMode) {
        toggleTheme();
      } else if (settings.theme === "light" && isDarkMode) {
        toggleTheme();
      }

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        ...profileForm,
        interests,
        languagePreference: settings.languagePreference,
      }));

      toast.success("Settings saved successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await apiClient.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.user) {
        setUser(response.data.user);
        toast.success('Profile photo updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests(prev => [...prev, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(prev => prev.filter(i => i !== interestToRemove));
  };

  const handleCategoryToggle = (categoryId, channel) => {
    setSettings(prev => ({
      ...prev,
      notificationCategories: {
        ...prev.notificationCategories,
        [categoryId]: {
          ...prev.notificationCategories[categoryId],
          [channel]: !prev.notificationCategories[categoryId][channel],
        }
      }
    }));
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeSelect = (themeId) => {
    setSettings(prev => ({ ...prev, theme: themeId }));
    setTheme(themeId);
  };

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

  const handleResendVerification = async () => {
    try {
      await apiClient.post('/users/request-verification');
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
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
                {/* Profile Card */}
                <div className="w-full bg-card backdrop-blur-3xl p-4 md:p-8 sm:p-10 rounded-2xl md:rounded-[32px] border border-border shadow-xl md:shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 w-full relative">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div
                        className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:opacity-90 transition-opacity border-2 border-border"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-accent rounded-full flex items-center justify-center text-4xl font-black text-foreground tracking-tighter">
                            {getInitials(user?.name)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 hover:bg-blue-500 border-2 border-card rounded-full flex items-center justify-center transition-colors"
                      >
                        {uploadingPhoto ? (
                          <Loader2 size={14} className="animate-spin text-foreground" />
                        ) : (
                          <Camera size={14} className="text-foreground" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="absolute -bottom-1 left-1 w-5 h-5 bg-green-500 border-4 border-card rounded-full" />
                    </div>

                    <div className="flex-1 text-center sm:text-left pt-2 w-full">
                      {!isEditing ? (
                        <>
                          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{user?.name}</h1>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <p className="text-blue-400 font-medium flex items-center gap-2">
                              <GraduationCap size={18} />
                              Student • {user?.level || 'Level Not Set'}
                            </p>
                            {user?.studentID && (
                              <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                                <Ticket size={14} />
                                {user.studentID}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                            {user?.emailVerified ? (
                              <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                                <CheckCircle2 size={16} />
                                Email Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-red-400 text-sm">
                                <XCircle size={16} />
                                Not Verified
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 w-full">
                          <div>
                            <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1 mb-1 block text-left">Full Name</label>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm(p => ({...p, name: e.target.value}))}
                              className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="sm:absolute top-2 right-2 w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 bg-accent hover:bg-primary/10 border border-border text-foreground px-5 py-2.5 rounded-full text-sm font-bold transition-all w-full sm:w-auto justify-center"
                        >
                          <User size={16} />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setIsEditing(false)}
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-muted-foreground mt-1 flex-shrink-0">
                        <Mail size={18} />
                      </div>
                      <div className="w-full overflow-hidden">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Email (Read Only)</label>
                        <div className="text-foreground font-medium truncate mt-1" title={user?.email}>{user?.email}</div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-muted-foreground mt-1 flex-shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div className="w-full">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1 mb-1 block">Phone Number</label>
                        {!isEditing ? (
                          <div className="text-foreground font-medium mt-1">{profileForm.phoneNumber || 'Not provided'}</div>
                        ) : (
                          <input
                            type="text"
                            value={profileForm.phoneNumber}
                            onChange={(e) => setProfileForm(p => ({...p, phoneNumber: e.target.value}))}
                            placeholder="+250..."
                            className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Academic Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-purple-400 mt-1 flex-shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div className="w-full overflow-hidden">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">College</label>
                        <div className="text-foreground font-medium truncate mt-1">{getRefName(user?.college)}</div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-blue-400 mt-1 flex-shrink-0">
                        <Building size={18} />
                      </div>
                      <div className="w-full overflow-hidden">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">School</label>
                        <div className="text-foreground font-medium truncate mt-1">{getRefName(user?.school)}</div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-emerald-400 mt-1 flex-shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div className="w-full overflow-hidden">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Department</label>
                        <div className="text-foreground font-medium truncate mt-1">{getRefName(user?.department)}</div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-amber-400 mt-1 flex-shrink-0">
                        <GraduationCap size={18} />
                      </div>
                      <div className="w-full overflow-hidden">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Class</label>
                        <div className="text-foreground font-medium truncate mt-1">
                          {user?.classId?.name ? `${user.classId.name} (${user.classId.code || ''})` : 'Not assigned'}
                        </div>
                      </div>
                    </div>

                    {/* Level/Year - Display Only */}
                    <div className="bg-black/30 border border-border p-5 rounded-2xl flex items-start gap-4 transition-colors hover:bg-white/[0.03]">
                      <div className="bg-accent p-3 rounded-full text-blue-400 mt-1 flex-shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div className="w-full overflow-hidden">
                        <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest pl-1">Level / Year</label>
                        <div className="text-foreground font-medium truncate mt-1">
                          {user?.level || 'Not set'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interests Section */}
                  <div className="pt-8 border-t border-border w-full">
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Hash size={14} />
                      Interests & Academic Tags
                    </label>

                    <div className="flex flex-wrap gap-2.5 items-center">
                      <AnimatePresence>
                        {interests?.map((tag, idx) => (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={`${tag}-${idx}`}
                            className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                          >
                            {tag}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveInterest(tag)}
                                className="p-0.5 hover:bg-blue-500/20 rounded-full transition-colors ml-1 text-blue-400"
                                title="Remove interest"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </motion.span>
                        ))}
                      </AnimatePresence>

                      {!interests?.length && !isEditing && (
                        <span className="text-neutral-600 text-sm italic py-2">No interests added yet. Click edit to add tags.</span>
                      )}

                      {isEditing && (
                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                          <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddInterest();
                              }
                            }}
                            placeholder="Add interest..."
                            className="bg-black/40 border border-border rounded-full px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 placeholder:text-neutral-600"
                          />
                          <button
                            onClick={handleAddInterest}
                            disabled={!newInterest.trim()}
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-foreground p-2 rounded-full transition-all disabled:opacity-30"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="pt-8 border-t border-border w-full mt-8">
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                      <ShieldCheck size={14} />
                      Account Info
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                          <User size={16} />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Role</div>
                        <div className="text-foreground font-medium text-sm capitalize">{user?.role?.replace('_', ' ')}</div>
                      </div>

                      <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                          <Calendar size={16} />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Joined</div>
                        <div className="text-foreground font-medium text-sm">{formatDate(user?.createdAt)}</div>
                      </div>

                      <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                          <Clock size={16} />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Active</div>
                        <div className="text-foreground font-medium text-sm">{formatDate(user?.lastActiveAt)}</div>
                      </div>

                      <div className="bg-black/30 border border-border p-4 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                          <CheckCircle2 size={16} />
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Onboarding</div>
                        <div className={`font-medium text-sm ${user?.hasCompletedOnboarding ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {user?.hasCompletedOnboarding ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-2xl shadow-xl">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>

                  {/* Global Toggles */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Channels</h3>
                    {[
                      { key: "push", label: "Push Notifications", desc: "Receive alerts on this device" },
                      { key: "email", label: "Email Notifications", desc: "Receive alerts via email" },
                      { key: "sms", label: "SMS Notifications", desc: "Receive alerts via SMS" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                        <div>
                          <h4 className="font-medium text-foreground">{label}</h4>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggle(key)}
                          className={`w-14 h-8 rounded-full transition-colors ${settings[key] ? "bg-blue-600" : "bg-accent"}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${settings[key] ? "translate-x-7" : "translate-x-1"}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Category-Specific Preferences */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Category Preferences</h3>
                    {NOTIFICATION_CATEGORIES.map((category) => (
                      <div key={category.id} className="p-4 bg-accent/50 rounded-xl space-y-3">
                        <div>
                          <h4 className="font-medium text-foreground">{category.label}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <div className="flex gap-3">
                          {["push", "email", "sms"].map((channel) => (
                            <button
                              key={channel}
                              onClick={() => handleCategoryToggle(category.id, channel)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                settings.notificationCategories[category.id][channel]
                                  ? "bg-blue-600 text-white"
                                  : "bg-accent text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {channel.charAt(0).toUpperCase() + channel.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quiet Hours */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quiet Hours</h3>
                    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground">Enable Quiet Hours</h4>
                        <p className="text-sm text-muted-foreground">Pause non-critical notifications</p>
                      </div>
                      <button
                        onClick={() => {
                          setQuietHoursEnabled(!quietHoursEnabled);
                          handleToggle("quietHoursEnabled");
                        }}
                        className={`w-14 h-8 rounded-full transition-colors ${quietHoursEnabled ? "bg-blue-600" : "bg-accent"}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${quietHoursEnabled ? "translate-x-7" : "translate-x-1"}`} />
                      </button>
                    </div>
                    {quietHoursEnabled && (
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
                  </div>

                  {/* Daily Digest */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Digest</h3>
                    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground">Daily Digest</h4>
                        <p className="text-sm text-muted-foreground">AI summary delivered to email</p>
                      </div>
                      <button
                        onClick={() => handleToggle("digestEnabled")}
                        className={`w-14 h-8 rounded-full transition-colors ${settings.digestEnabled ? "bg-blue-600" : "bg-accent"}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${settings.digestEnabled ? "translate-x-7" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "preferences" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Interests */}
                <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-2xl shadow-xl">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Interests & Tags</h2>
                  <p className="text-sm text-muted-foreground mb-4">Manage your interests for AI-based event recommendations</p>

                  <div className="flex flex-wrap gap-2.5 items-center mb-4">
                    <AnimatePresence>
                      {interests?.map((tag, idx) => (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={`${tag}-${idx}`}
                          className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveInterest(tag)}
                            className="p-0.5 hover:bg-blue-500/20 rounded-full transition-colors ml-1"
                          >
                            <X size={14} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                      placeholder="Add interest..."
                      className="bg-black/40 border border-border rounded-full px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 placeholder:text-neutral-600"
                    />
                    <button
                      onClick={handleAddInterest}
                      disabled={!newInterest.trim()}
                      className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-foreground p-2 rounded-full transition-all disabled:opacity-30"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Language Preference */}
                <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-2xl shadow-xl">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Language Preference</h2>
                  <p className="text-sm text-muted-foreground mb-4">Choose your preferred language for AI translations</p>
                  <select
                    value={settings.languagePreference}
                    onChange={(e) => setSettings(prev => ({ ...prev, languagePreference: e.target.value }))}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  >
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                  </select>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-2xl shadow-xl">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
                  <p className="text-sm text-muted-foreground mb-6">Choose your preferred theme</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {THEMES.map((theme) => {
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
                            <Activity size={24} className={theme.id === "dark" ? "text-white" : "text-neutral-900"} />
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
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-2xl shadow-xl">
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
                </div>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card backdrop-blur-3xl border border-border p-6 rounded-2xl shadow-xl">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Privacy</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground">Profile Visibility</h4>
                        <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                        className="bg-accent border border-border rounded-lg px-3 py-2 text-foreground text-sm"
                      >
                        <option value="students">Students Only</option>
                        <option value="staff">Staff Only</option>
                        <option value="everyone">Everyone</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
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
