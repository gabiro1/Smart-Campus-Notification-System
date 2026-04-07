import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Clock,
  Settings,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Headset,
  Megaphone,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Standardized routing paths
const studentItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  { icon: Megaphone, label: "Announcements", path: "/student/announcements" },
  { icon: Calendar, label: "Time Table", path: "/student/timetable" },
  { icon: MessageSquare, label: "Messages", path: "/student/messages" },
  { icon: Sparkles, label: "Events", path: "/student/events" },
  { icon: Clock, label: "Reminders", path: "/student/reminders" },
];

export default function StudentSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-card border-r border-white/5 flex flex-col z-50 transition-all duration-300 w-20 md:w-72">
      {/* 1. Header / Organization Branding */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center md:justify-between p-2 rounded-xl hover:bg-muted transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-bold border border-blue-500/20">
              U
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-bold text-white tracking-tight">
                UniNotify AI
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Student Portal
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
      </div>

      {/* 3. Bottom Actions */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-card">
        {/* Reused SidebarLink for consistent UI and active state handling */}
        <SidebarLink
          item={{ icon: Settings, label: "Settings", path: "/student/settings" }}
          active={location.pathname === "/student/settings"}
        />
        
        {/* Help is usually a modal/trigger, not a route, so it remains a standard button but matches styling */}
        <button className="flex items-center justify-center md:justify-start p-3 md:p-2.5 w-full rounded-xl transition-all duration-200 relative group text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200">
          <div className="flex items-center gap-3">
            <Headset size={20} strokeWidth={2} />
            <span className="hidden md:inline text-sm font-semibold">
              Help
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}

// Modular component for DRY code and consistent hit-areas
function SidebarLink({ item, active }) {
  return (
    <Link
      to={item.path}
      className={`flex items-center justify-center md:justify-start p-3 md:p-2.5 rounded-xl transition-all duration-200 relative group ${
        active
          ? "bg-white/[0.08] text-white shadow-lg"
          : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className="hidden md:inline text-sm font-semibold">
          {item.label}
        </span>
      </div>
    </Link>
  );
}