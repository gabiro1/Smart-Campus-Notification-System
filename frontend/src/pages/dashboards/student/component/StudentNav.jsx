import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Bell,
  Clock,
  Settings,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Headset,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const studentItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/feed" },
  { icon: Calendar, label: "Time Table", path: "/timetable" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Sparkles, label: "Events", path: "/events" },
  { icon: Clock, label: "Reminders", path: "/reminders" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export default function StudentSidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen bg-[#0D0D0D] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* 1. Header (Same Structure as Admin) */}
      <div className="p-4">
        <button className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-[#1A1A1A] transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-bold border border-blue-500/20">
              U
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-white tracking-tight">
                UniNotify AI
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Student Portal
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-neutral-600 group-hover:text-neutral-400">
            <ChevronUp size={12} className="-mb-1" />
            <ChevronDown size={12} />
          </div>
        </button>
      </div>

      {/* 2. Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar">
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-4 px-3">
            Academic
          </p>

          {studentItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        {/* Separator */}
        <div className="border-t border-white/5 mx-2" />

        {/* AI Insight Card */}
        <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-5 mb-4 mt-3">
          <span className="bg-blue-500/20 text-blue-400 text-[9px] font-black px-2 py-1 rounded-md">
            AI
          </span>
          <h4 className="text-sm font-bold mt-3 text-white">
            Smart Academic Feed
          </h4>
          <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
            Your events are ranked based on engagement and relevance.
          </p>
        </div>
      </div>

      {/* 3. Bottom Actions */}
      <div className="p-4 border-t border-white/5 space-y-1 bg-[#0D0D0D]">
        <Link
          to="/settings"
          className="flex items-center gap-3 p-2 pl-4 text-neutral-500 hover:text-white w-full transition-colors rounded-sm hover:bg-white/[0.03]"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button className="flex items-center gap-3 p-2 pl-4 text-neutral-500 hover:text-white w-full transition-colors rounded-sm hover:bg-white/[0.03] mt-1">
          <Headset size={18} />
          <span className="text-sm font-medium">Help Center</span>
        </button>
      </div>
    </aside>
  );
}

/* -------- Reusable Link Component -------- */

function SidebarLink({ item, active }) {
  return (
    <Link
      to={item.path}
      className={`flex items-center justify-between p-2 rounded-sm transition-all duration-200 group ${
        active
          ? "bg-[#1A1A1A] text-white border border-white/5 shadow-lg"
          : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
        <span className="text-sm font-semibold">{item.label}</span>
      </div>
    </Link>
  );
}
