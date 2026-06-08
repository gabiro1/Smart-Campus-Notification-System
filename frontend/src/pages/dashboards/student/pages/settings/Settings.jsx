import { useState } from "react";
import { GlassCard } from "@/components/shared";
import { User, Bell, Shield, Palette, Sun, Moon } from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function StudentSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const regNo = user?.registrationNumber || user?.studentID || "262097457";

  const saveProfile = () => {
    console.log("Save profile:", { name, email, phone });
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <GlassCard padding="p-4">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </GlassCard>

      {activeTab === "profile" && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Registration No.</label>
              <input type="text" value={regNo} disabled className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
            </div>
          </div>
          <button
            onClick={saveProfile}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </GlassCard>
      )}

      {activeTab === "notifications" && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { label: "Push Notifications", desc: "Receive in-app alerts", enabled: true },
              { label: "Email Notifications", desc: "Get email digests", enabled: true },
              { label: "SMS Alerts", desc: "Urgent messages via SMS", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-xl bg-accent/50">
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.enabled ? "bg-primary" : "bg-border"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${item.enabled ? "left-[22px]" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === "security" && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Security</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Current Password</label>
              <input type="password" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">New Password</label>
              <input type="password" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Update Password
            </button>
          </div>
        </GlassCard>
      )}

      {activeTab === "appearance" && (
        <GlassCard>
          <h2 className="text-sm font-semibold text-foreground mb-4">Appearance</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent border border-border text-foreground text-sm font-medium hover:bg-accent/80 transition-colors">
              <Sun size={15} /> Light
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Moon size={15} /> Dark
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
