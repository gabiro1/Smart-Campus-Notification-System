import { useState } from "react";
import { Settings } from "lucide-react";
import ToggleSwitch from "../shared/ToggleSwitch";

const defaultPreferences = {
  urgentAlerts: true,
  announcementAlerts: true,
  inAppSound: false,
  vibration: false,
  quietHours: false,
};

export default function NotificationSettings({ onPreferenceChange }) {
  const [prefs, setPrefs] = useState(defaultPreferences);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 520;
      g.gain.value = 0.1;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio not available", e);
    }
  };

  const testVibration = () => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      console.warn("Vibration not available", e);
    }
  };

  const handleToggle = (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);

    if (key === "inAppSound" && value) {
      playChime();
    }
    if (key === "vibration" && value) {
      testVibration();
    }

    if (onPreferenceChange) {
      onPreferenceChange(newPrefs);
    }
  };

  const rows = [
    { key: "urgentAlerts", label: "Urgent alerts", description: "Class cancellations, room changes" },
    { key: "announcementAlerts", label: "Announcement alerts", description: "From lecturers and admin" },
    { key: "inAppSound", label: "In-app sound", description: "Play a sound for new notifications" },
    { key: "vibration", label: "Vibration", description: "Vibrate on urgent alerts (mobile)" },
    { key: "quietHours", label: "Quiet hours (22:00\u201307:00)", description: "Pause all non-urgent alerts" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Settings size={14} className="text-foreground" />
        <h3 className="text-[14px] font-medium text-foreground">Notification settings</h3>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={`flex items-center gap-3 p-4 ${
              i < rows.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground">{row.label}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{row.description}</p>
            </div>
            <ToggleSwitch
              enabled={prefs[row.key]}
              onChange={(val) => handleToggle(row.key, val)}
            />
          </div>
        ))}
        <div className="border-t border-border p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground">Email digest</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Receive a summary of unread activity
            </p>
          </div>
          <select
            defaultValue="off"
            onChange={(e) => {
              console.log("Email digest set to:", e.target.value);
            }}
            className="bg-muted border border-border text-foreground rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer focus:outline-none"
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
    </div>
  );
}
