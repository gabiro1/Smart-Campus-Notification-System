import {
  LayoutDashboard,
  PenTool,
  Megaphone,
  Bell,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const routes = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/lecturer" },
  { icon: PenTool, label: "Create Announcement", path: "/lecturer/create" },
  {
    icon: Megaphone,
    label: "My Announcements",
    path: "/lecturer/announcements",
  },
  { icon: Bell, label: "Notifications", path: "/lecturer/notifications" },
  { icon: Users, label: "My Classes", path: "/lecturer/classes" },
  { icon: BarChart3, label: "Analytics", path: "/lecturer/analytics" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-[#0D0D0D]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 transition-all duration-300 w-20 md:w-72 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            L
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight">
              Lecturer Portal
            </span>
            <span className="text-[10px] text-blue-400/80 font-medium uppercase tracking-wider">
              Workspace
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {routes.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center md:justify-start p-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                active
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span
                  className={`hidden md:inline text-sm ${active ? "font-semibold" : "font-medium"}`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link
          to="/lecturer/settings"
          className="flex items-center justify-center md:justify-start p-3 gap-3 text-neutral-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]"
        >
          <Settings size={20} />
          <span className="hidden md:inline text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
