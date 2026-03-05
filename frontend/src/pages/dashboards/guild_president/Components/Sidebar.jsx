import {
  LayoutDashboard,
  Megaphone,
  Bell,
  Activity,
  Users,
  Settings,
  ChevronUp,
  ChevronDown,
  Headset,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const guildItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/guild/overview" },
  { icon: Megaphone, label: "Post Events", path: "/guild/post-events" },
  { icon: Bell, label: "Notifications", path: "/guild/notifications" },
  { icon: Activity, label: "Engagement", path: "/guild/engagement" },
  { icon: Users, label: "Members", path: "/guild/members" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-[#0D0D0D]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 transition-all duration-300 w-20 md:w-72 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* 1. Header */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center md:justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              G
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-bold text-white tracking-tight">
                Guild Portal
              </span>
              <span className="text-[10px] text-blue-400/80 font-medium">
                President Dashboard
              </span>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-1 text-neutral-600 group-hover:text-neutral-400">
            <ChevronUp size={12} className="-mb-1" />
            <ChevronDown size={12} />
          </div>
        </button>
      </div>

      {/* 2. Navigation */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 space-y-6 custom-scrollbar overflow-x-hidden">
        <nav className="space-y-2 mt-4">
          <p className="hidden md:block text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-4 px-3">
            Management
          </p>
          {guildItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>
      </div>

      {/* 3. Bottom Actions */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-transparent">
        <Link
          to="/guild /settings"
          className="flex items-center justify-center md:justify-start md:gap-3 p-3 md:p-2 md:pl-4 text-neutral-500 hover:text-white w-full transition-colors rounded-xl hover:bg-white/[0.03]"
        >
          <Settings size={20} />
          <span className="hidden md:inline text-sm font-medium">Settings</span>
        </Link>
        <button className="flex items-center justify-center md:justify-start md:gap-3 p-3 md:p-2 md:pl-4 text-neutral-500 hover:text-white w-full transition-colors rounded-xl hover:bg-white/[0.03]">
          <Headset size={20} />
          <span className="hidden md:inline text-sm font-medium">
            Help Desk
          </span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }) {
  return (
    <Link
      to={item.path}
      className={`flex items-center justify-center md:justify-start p-3 md:p-2.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
        active
          ? "bg-blue-500/10 text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-blue-500/20"
          : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200"
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
      )}
      <div className="flex items-center gap-3 relative z-10">
        <item.icon
          size={20}
          strokeWidth={active ? 2.5 : 2}
          className={active ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}
        />
        <span
          className={`hidden md:inline text-sm ${active ? "font-bold" : "font-semibold"}`}
        >
          {item.label}
        </span>
      </div>
    </Link>
  );
}
