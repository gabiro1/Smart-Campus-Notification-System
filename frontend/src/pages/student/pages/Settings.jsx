/**
 * @page Settings
 * @description Manages localizations, notification channels, and account security.
 */
import { Globe, Bell, Shield, Moon } from "lucide-react";

export default function Settings() {
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
            Language & Region
          </h3>
        </div>
        <div className="flex gap-2">
          {["English", "Kinyarwanda", "French"].map((lang) => (
            <button
              key={lang}
              className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${lang === "English" ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/10 text-neutral-500"}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {/* Notification Toggles */}
      <section className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
        <div className="flex items-center gap-3 text-blue-400">
          <Bell size={20} />
          <h3 className="font-bold text-sm uppercase tracking-widest">
            Notifications
          </h3>
        </div>
        <ToggleRow
          label="Push Notifications"
          description="Receive alerts on this device"
          active={true}
        />
        <ToggleRow
          label="SMS Fallback"
          description="Receive critical alerts when offline"
          active={true}
        />
      </section>
    </div>
  );
}

function ToggleRow({ label, description, active }) {
  return (
    <div className="flex items-center justify-between p-2">
      <div>
        <p className="text-white text-sm font-bold">{label}</p>
        <p className="text-[10px] text-neutral-500">{description}</p>
      </div>
      <div
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? "bg-blue-600" : "bg-neutral-800"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`}
        />
      </div>
    </div>
  );
}
