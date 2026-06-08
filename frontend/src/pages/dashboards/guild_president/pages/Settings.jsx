import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Bell, Shield, Users, Globe, Mail,
  Save, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";

function ToggleSwitch({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          enabled ? "bg-primary" : "bg-accent"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function GuildSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoPublishEvents: false,
    classRepNotifications: true,
    eventReminders: true,
    publicProfile: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your guild president dashboard preferences</p>
      </motion.div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-2">
          <Bell size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-2 ml-9">Control how you receive updates</p>

        <div className="divide-y divide-border">
          <ToggleSwitch
            enabled={settings.notifications}
            onChange={v => updateSetting("notifications", v)}
            label="Push Notifications"
            description="Receive push notifications for guild activities"
          />
          <ToggleSwitch
            enabled={settings.emailAlerts}
            onChange={v => updateSetting("emailAlerts", v)}
            label="Email Alerts"
            description="Get email notifications for important updates"
          />
          <ToggleSwitch
            enabled={settings.eventReminders}
            onChange={v => updateSetting("eventReminders", v)}
            label="Event Reminders"
            description="Receive reminders before upcoming events"
          />
          <ToggleSwitch
            enabled={settings.classRepNotifications}
            onChange={v => updateSetting("classRepNotifications", v)}
            label="Class Rep Updates"
            description="Get notified when class reps are approved or rejected"
          />
        </div>
      </GlassCard>

      <GlassCard className="mt-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Dashboard Preferences</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-2 ml-9">Customize your dashboard behavior</p>

        <div className="divide-y divide-border">
          <ToggleSwitch
            enabled={settings.autoPublishEvents}
            onChange={v => updateSetting("autoPublishEvents", v)}
            label="Auto-Publish Events"
            description="Skip review queue for events you create (direct publish)"
          />
          <ToggleSwitch
            enabled={settings.publicProfile}
            onChange={v => updateSetting("publicProfile", v)}
            label="Public Profile"
            description="Show your profile to students on the guild portal"
          />
        </div>
      </GlassCard>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
