/**
 * @page Settings
 * @description Manages localizations, notification channels, and account security.
 */
import { useState, useEffect } from "react";
import { Globe, Bell, Shield, Moon } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../../../../services/authService";
import LanguageToggle from "../../../../../components/ui/LanguageToggle";

export default function Settings() {
  const [preferences, setPreferences] = useState({
    push: true,
    email: true,
    sms: false,
    categories: {
      events: { push: true, email: true, sms: false },
      reminders: { push: true, email: true, sms: false },
      governance: { push: true, email: true, sms: false }
    }
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data.success) {
        setUser(data.user);
        if (data.user?.notificationPreferences) {
          setPreferences(data.user.notificationPreferences);
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const oldPrefs = { ...preferences };
    try {
      // Optimistic update
      setPreferences(prev => ({ ...prev, [key]: value }));
      await authService.updateNotificationPreferences({ [key]: value });
      toast.success("Preferences saved");
    } catch (error) {
      // Rollback on error
      setPreferences(oldPrefs);
      toast.error("Failed to save preferences");
    }
  };

  const updateCategoryPreference = (category, channel, value) => {
    const oldPrefs = { ...preferences };
    const newCategories = { ...preferences.categories };
    newCategories[category] = { ...newCategories[category], [channel]: value };

    // Optimistic update
    setPreferences(prev => ({ ...prev, categories: newCategories }));

    authService.updateNotificationPreferences({
      categories: { [category]: { [channel]: value } }
    })
      .then(() => toast.success("Preferences saved"))
      .catch((error) => {
        setPreferences(oldPrefs);
        toast.error("Failed to save preferences");
      });
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-white/10 rounded w-1/3"></div>
          <div className="h-40 bg-white/5 rounded-[32px]"></div>
          <div className="h-64 bg-white/5 rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
        Settings
      </h2>

      {/* Language Preference */}
      <section className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
        <div className="flex items-center gap-3 text-blue-400">
          <Globe size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">
            Notification Language
          </h3>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-neutral-500">
            Choose your preferred language for notification content. Announcements will be automatically translated when possible.
          </p>
          <div className="flex gap-3">
            <LanguageToggle
              initialLanguage={user?.languagePreference || "en"}
              onLanguageChange={(lang) => setUser(prev => prev ? { ...prev, languagePreference: lang } : null)}
            />
          </div>
          <p className="text-xs text-neutral-400">
            Current: {user?.languagePreference === "en" ? "English" : "Kinyarwanda"}
          </p>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="glass p-6 rounded-[32px] border border-white/5 space-y-6">
        <div className="flex items-center gap-3 text-blue-400">
          <Bell size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">
            Notification Channels
          </h3>
        </div>

        {/* Global Toggles */}
        <div className="space-y-3">
          <ToggleRow
            label="Push Notifications"
            description="Receive alerts on this device"
            active={preferences.push}
            onChange={(value) => updatePreference('push', value)}
          />
          <ToggleRow
            label="Email Notifications"
            description="Receive alerts via email"
            active={preferences.email}
            onChange={(value) => updatePreference('email', value)}
          />
          <ToggleRow
            label="SMS Notifications"
            description="Receive alerts via SMS (charges may apply)"
            active={preferences.sms}
            onChange={(value) => updatePreference('sms', value)}
          />
        </div>
      </section>

      {/* Category-Specific Overrides */}
      <section className="glass p-6 rounded-[32px] border border-white/5 space-y-6">
        <div className="flex items-center gap-3 text-purple-400">
          <Bell size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">
            Category Preferences
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Customize which channels you receive for each notification type.
          Global settings above apply as defaults.
        </p>

        {['events', 'reminders', 'governance'].map((category) => (
          <div key={category} className="border-t border-white/5 pt-4 first:border-0 first:pt-0">
            <h4 className="text-sm font-bold text-white mb-3 capitalize">
              {category} Notifications
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <ChannelToggle
                label="Push"
                active={preferences.categories[category]?.push ?? preferences.push}
                onChange={(val) => updateCategoryPreference(category, 'push', val)}
              />
              <ChannelToggle
                label="Email"
                active={preferences.categories[category]?.email ?? preferences.email}
                onChange={(val) => updateCategoryPreference(category, 'email', val)}
              />
              <ChannelToggle
                label="SMS"
                active={preferences.categories[category]?.sms ?? preferences.sms}
                onChange={(val) => updateCategoryPreference(category, 'sms', val)}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Info Box */}
      <section className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-[24px] text-sm">
        <p className="text-amber-400">
          <strong>Critical Alerts:</strong> In emergencies, administrators can send priority-critical notifications that bypass your preferences to ensure you receive essential information.
        </p>
      </section>
    </div>
  );
}

function ToggleRow({ label, description, active, onChange }) {
  return (
    <div className="flex items-center justify-between p-2">
      <div>
        <p className="text-white text-sm font-bold">{label}</p>
        <p className="text-[10px] text-neutral-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!active)}
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-blue-600" : "bg-neutral-800"}`}
        aria-pressed={active}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );
}

function ChannelToggle({ label, active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
        active
          ? "bg-blue-600 border-blue-500 text-white"
          : "bg-white/5 border-white/10 text-neutral-500 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
