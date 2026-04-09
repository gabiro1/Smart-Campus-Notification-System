import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Bell, Palette, Shield, Target, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    autoTargeting: true,
    defaultAudience: "all",
    notificationSound: true,
    digestFrequency: "daily",
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "bg-accent border border-border"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "targeting", label: "Student Targeting", icon: Target },
    { id: "branding", label: "Guild Branding", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
          Guild Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your dashboard and communication rules.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          {activeTab === "notifications" && (
            <GlassCard className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive instant alerts on your device</p>
                  </div>
                  <Toggle enabled={settings.pushEnabled} onChange={() => toggleSetting('pushEnabled')} />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Email Fallback</p>
                    <p className="text-sm text-muted-foreground">Get email notifications when offline</p>
                  </div>
                  <Toggle enabled={settings.emailEnabled} onChange={() => toggleSetting('emailEnabled')} />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Notification Sound</p>
                    <p className="text-sm text-muted-foreground">Play sound for new notifications</p>
                  </div>
                  <Toggle enabled={settings.notificationSound} onChange={() => toggleSetting('notificationSound')} />
                </div>

                <div className="py-3">
                  <label className="block text-sm font-medium text-foreground mb-2">Digest Frequency</label>
                  <select
                    value={settings.digestFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, digestFrequency: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === "targeting" && (
            <GlassCard className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Student Targeting</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Auto-Filter by Department</p>
                    <p className="text-sm text-muted-foreground">Automatically target your department</p>
                  </div>
                  <Toggle enabled={settings.autoTargeting} onChange={() => toggleSetting('autoTargeting')} />
                </div>

                <div className="py-3">
                  <label className="block text-sm font-medium text-foreground mb-2">Default Audience</label>
                  <select
                    value={settings.defaultAudience}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultAudience: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 text-foreground"
                  >
                    <option value="all">All Students</option>
                    <option value="department">My Department</option>
                    <option value="year">Specific Year</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === "branding" && (
            <GlassCard className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Guild Branding</h2>
              <p className="text-muted-foreground">Customize how your guild appears to students.</p>
              <div className="p-4 bg-accent rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Branding settings coming soon</p>
              </div>
            </GlassCard>
          )}

          {activeTab === "security" && (
            <GlassCard className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Security Settings</h2>
              <div className="p-4 bg-accent rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Security settings managed by admin</p>
              </div>
            </GlassCard>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}