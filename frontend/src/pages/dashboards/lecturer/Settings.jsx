import React, { useState, useEffect, useRef } from "react";
import { GlassCard, FormField, FormHelperText } from "@/components/shared";
import { User, Bell, Clock, Shield, Save, Loader2, LogOut, Upload, Camera, AlertTriangle, Trash2 } from "lucide-react";
import authService from "../../../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../services/apiClient";

// Custom Liquid Toggle Switch
const LiquidToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${
      enabled
        ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/50"
        : "bg-black/50 border border-white/10 hover:border-white/20"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    profileUrl: "",
    profilePicture: null,
    currentlyInOffice: false,
    officeHours: "",
    emailAlertsComments: false,
    pushAlertsHOD: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "availability", label: "Availability", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const user = await authService.getCurrentUser();
        
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          profileUrl: user.profilePicture || "",
        }));
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Could not load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('profilePicture', file);

      const response = await apiClient.post('/users/profile/photo', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.user?.profilePicture) {
        setFormData(prev => ({ ...prev, profileUrl: response.data.user.profilePicture }));
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "profile") {
        await authService.updateProfile({
          name: formData.name,
          profilePicture: formData.profileUrl,
        });
      }
      
      if (activeTab === "notifications") {
        await authService.updateNotificationPreferences({
          emailAlertsComments: formData.emailAlertsComments,
          pushAlertsHOD: formData.pushAlertsHOD,
        });
      }
      
      if (activeTab === "security" && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsSaving(false);
          return;
        }
        await authService.updateProfile({
          currentPassword: formData.currentPassword,
          password: formData.newPassword,
        });
      }
      
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-neutral-500 text-sm animate-pulse">Synchronizing preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          Account Settings
        </h1>
        <p className="text-neutral-400 font-medium">
          Manage your personal profile, availability, and notification parameters.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar-within-page */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.03] font-medium"
                }`}
              >
                <tab.icon
                  size={18}
                  className={isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          
          <GlassCard className="space-y-6 min-h-[400px]">
            {activeTab === "profile" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-white">Profile Details</h2>
                  <p className="text-sm text-neutral-400 mt-1">Information displayed to students and staff.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Full Name"
                    htmlFor="name"
                    required
                    helper="Your display name as shown to students"
                  >
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </FormField>

                  {/* Profile Picture Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                          {formData.profileUrl ? (
                            <img 
                              src={formData.profileUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={32} className="text-neutral-600" />
                          )}
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 size={24} className="animate-spin text-blue-500" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transition-all hover:scale-110"
                        >
                          <Camera size={14} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">Upload a new photo</p>
                        <p className="text-xs text-neutral-500">JPG, PNG or GIF. Max 5MB.</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                          <Upload size={14} /> Choose File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "availability" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-white">Office Hours & Availability</h2>
                  <p className="text-sm text-neutral-400 mt-1">Let students know when you are available for consultations.</p>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between group p-4 border border-white/5 bg-white/[0.02] rounded-xl hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-white font-bold text-sm">Currently In Office</p>
                      <p className="text-neutral-500 text-xs mt-1 max-w-sm">
                        Toggle this on when you are physically in your office to allow walk-ins.
                      </p>
                    </div>
                    <LiquidToggle 
                      enabled={formData.currentlyInOffice} 
                      onChange={(val) => setFormData({ ...formData, currentlyInOffice: val })} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide">Standard Office Hours</label>
                    <input
                      type="text"
                      value={formData.officeHours}
                      onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                      placeholder="e.g. Mon & Wed, 2PM - 4PM"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-white">Notification Parameters</h2>
                  <p className="text-sm text-neutral-400 mt-1">Control how and when the system alerts you.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-blue-200 transition-colors">
                        Email Alerts for Comments
                      </p>
                      <p className="text-neutral-500 text-xs mt-1.5">
                        Receive an email notifying you when a student comments on your announcements.
                      </p>
                    </div>
                    <LiquidToggle 
                      enabled={formData.emailAlertsComments} 
                      onChange={(val) => setFormData({ ...formData, emailAlertsComments: val })} 
                    />
                  </div>

                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-red-300 transition-colors">
                        Push Alerts for HOD Directives
                      </p>
                      <p className="text-neutral-500 text-xs mt-1.5">
                        Allow high-priority emergency notifications from the Head of Department.
                      </p>
                    </div>
                    <LiquidToggle 
                      enabled={formData.pushAlertsHOD} 
                      onChange={(val) => setFormData({ ...formData, pushAlertsHOD: val })} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-white">Security Controls</h2>
                  <p className="text-sm text-neutral-400 mt-1">Update your authentication credentials.</p>
                </div>

                <div className="space-y-5 max-w-sm">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide">Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all" 
                    />
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button className="px-6 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10">
              Discard Changes
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-black transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20 hover:border-red-500/40"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* Danger Zone */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Danger Zone</h3>
          </div>
          <p className="text-sm text-neutral-400 mb-6">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background/50 border border-white/5 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-neutral-500 mt-1">Permanently delete your account and all associated data.</p>
              </div>
              <button className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
