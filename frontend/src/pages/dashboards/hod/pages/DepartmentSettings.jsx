import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Shield,
  Mail,
  Save,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "../../../../components/cards/GlassCard";

export default function DepartmentSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: true,
    autoApproveCP: false,
    allowStudentBroadcast: false,
  });

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    localStorage.setItem("hod_settings", JSON.stringify(settings));
    toast.success("Settings saved");
    setLoading(false);
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hod_settings") || "{}");
      if (saved.notificationsEnabled !== undefined) setSettings(saved);
    } catch {}
  }, []);

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Department Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your department preferences</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-blue-500/10">
            <Bell size={18} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">Control how you receive notifications</p>
          </div>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Enable Notifications"
            description="Receive notifications for department activities"
            checked={settings.notificationsEnabled}
            onChange={() => toggle("notificationsEnabled")}
          />
          <ToggleRow
            label="Email Notifications"
            description="Receive email notifications for pending approvals"
            checked={settings.emailNotifications}
            onChange={() => toggle("emailNotifications")}
          />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-amber-500/10">
            <Shield size={18} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Approvals</h2>
            <p className="text-xs text-muted-foreground">Configure approval workflows</p>
          </div>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Auto-Approve Class Reps"
            description="Automatically approve class representative proposals"
            checked={settings.autoApproveCP}
            onChange={() => toggle("autoApproveCP")}
          />
          <ToggleRow
            label="Allow Student Broadcasts"
            description="Allow students to broadcast announcements to the department"
            checked={settings.allowStudentBroadcast}
            onChange={() => toggle("allowStudentBroadcast")}
          />
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          {loading ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
          Save Settings
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${
          checked ? "bg-blue-600" : "bg-slate-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
