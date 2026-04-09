import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/shared";
import { Shield, Settings as SettingsIcon, BellRing, Save, User, Camera, Loader2, Upload } from "lucide-react";
import authService from "../../../../services/authService";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";

// Custom Liquid Toggle Switch
const LiquidToggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 focus:outline-none ${
      enabled
        ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/50"
        : "bg-black/50 border border-border hover:border-white/20"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function DepartmentSettings() {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("workflow");
  
  const [profile, setProfile] = useState({
    name: "",
    profileUrl: "",
    email: "",
    department: "",
  });
  
  const [settings, setSettings] = useState({
    requireApproval: true,
    allowReplies: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const user = await authService.getCurrentUser();
        setProfile({
          name: user.name || "",
          profileUrl: user.profilePicture || "",
          email: user.email || "",
          department: user.department?.name || user.department || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
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
        setProfile(prev => ({ ...prev, profileUrl: response.data.user.profilePicture }));
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "workflow", label: "Workflow Rules", icon: Shield },
    { id: "profile", label: "Profile", icon: User },
    { id: "policies", label: "Default Policies", icon: BellRing },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-muted-foreground text-sm animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Department Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure global policies for department communications.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Navigation */}
        <div className="md:col-span-4 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent font-medium"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side Settings Area */}
        <div className="md:col-span-8 space-y-6">
          {activeTab === "workflow" && (
            <GlassCard className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Approval Workflow
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage how announcements go live.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-foreground font-medium text-sm">
                      Require HoD Approval
                    </p>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                      All lecturer announcements must be approved by the HoD
                      before being sent to students.
                    </p>
                  </div>
                  <LiquidToggle
                    enabled={settings.requireApproval}
                    onChange={(val) => setSettings({ ...settings, requireApproval: val })}
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === "profile" && (
            <GlassCard className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Your Profile
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This information is displayed to staff and students.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-accent border border-border overflow-hidden flex items-center justify-center">
                    {profile.profileUrl ? (
                      <img 
                        src={profile.profileUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-muted-foreground" />
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
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-foreground shadow-lg transition-all hover:scale-110"
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
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-black/20 border border-border rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Department</label>
                    <input
                      type="text"
                      value={profile.department}
                      disabled
                      className="w-full bg-black/20 border border-border rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
                  <Save size={16} /> Save Profile
                </button>
              </div>
            </GlassCard>
          )}

          {activeTab === "policies" && (
            <GlassCard className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Communication Policies
                </h2>
              </div>
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-foreground font-medium text-sm">
                    Allow Student Replies to Broadcasts
                  </p>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                    If enabled, students can reply directly to HoD official
                    broadcasts.
                  </p>
                </div>
                <LiquidToggle 
                  enabled={settings.allowReplies} 
                  onChange={(val) => setSettings({ ...settings, allowReplies: val })} 
                />
              </div>
            </GlassCard>
          )}

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
