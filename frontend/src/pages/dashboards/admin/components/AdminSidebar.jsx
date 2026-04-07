import {
  LayoutDashboard,
  Users,
  Radio,
  BarChart3,
  Search,
  Settings,
  Activity,
  Database,
  Headset,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// 1. Primary Management Links (Mapped exactly to AppRoutes)
const coreItems = [
  { icon: LayoutDashboard, label: "System Overview", path: "/admin/overview" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  {
    icon: Radio,
    label: "Event Management",
    path: "/admin/events",
    badge: "Live",
  },
  { icon: BarChart3, label: "Full Analytics", path: "/admin/analytics" },
  { icon: Search, label: "User Directory", path: "/admin/directory" },
];

// 2. System & Tools Links (Mapped exactly to AppRoutes)
const systemItems = [
  { icon: Activity, label: "Maintenance", path: "/admin/maintenance" },
  { icon: Database, label: "Backups", path: "/admin/backups" },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen bg-card border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* 1. Account Header */}
      <div className="p-4">
        <button className="w-full flex items-center justify-between p-2 rounded-xl shadow-2xl hover:bg-muted transition-all group border border-transparent hover:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center font-black border border-blue-500/20">
              U
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-white tracking-tight">
                UniCore OS
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Super Admin
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-neutral-600 group-hover:text-neutral-400">
            <ChevronUp size={12} className="-mb-1" />
            <ChevronDown size={12} />
          </div>
        </button>
      </div>

      {/* 2. Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar mt-2">
        {/* Core Features */}
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-3 px-3">
            Core Features
          </p>
          {coreItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={
                location.pathname === item.path ||
                location.pathname.startsWith(item.path)
              }
            />
          ))}
        </nav>

        {/* System & Tools */}
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-3 px-3 pt-2 border-t border-white/5">
            System Tools
          </p>
          {systemItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        {/* Upgrade Prompt Card */}
        <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-5 mb-4 mt-6">
          <span className="bg-blue-500/20 text-blue-400 text-[9px] font-black px-2 py-1 rounded-md">
            PRO
          </span>
          <h4 className="text-sm font-bold mt-3 text-white">
            Smart AI Filtering
          </h4>
          <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
            Reduce notification fatigue with automated tagging.
          </p>
          <button className="flex items-center gap-2 text-[11px] font-bold text-blue-400 mt-4 hover:underline">
            Upgrade Now <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 3. Bottom Actions (Fixed at bottom) */}
      <div className="p-4 border-t border-white/5 space-y-1 bg-card">
        {/* Core Settings */}
        <Link
          to="/admin/settings"
          className={`flex items-center gap-3 p-2 pl-4 w-full transition-colors rounded-lg ${
            location.pathname === "/admin/settings"
              ? "bg-muted text-white border border-white/5 shadow-lg"
              : "text-neutral-500 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Core Settings</span>
        </Link>

        {/* Admin Help */}
        <Link
          to="/admin/help"
          className={`flex items-center gap-3 p-2 pl-4 mt-1 w-full transition-colors rounded-lg ${
            location.pathname === "/admin/help"
              ? "bg-muted text-white border border-white/5 shadow-lg"
              : "text-neutral-500 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <Headset size={18} />
          <span className="text-sm font-medium">Admin Help</span>
        </Link>
      </div>
    </aside>
  );
}

// Helper component for rendering links
function SidebarLink({ item, active }) {
  return (
    <Link
      to={item.path}
      className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 group ${
        active
          ? "bg-muted text-white border border-white/5 shadow-lg"
          : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon
          size={18}
          strokeWidth={active ? 2.5 : 2}
          className={active ? "text-blue-500" : ""}
        />
        <span className="text-sm font-semibold">{item.label}</span>
      </div>
      {item.badge && (
        <span className="bg-red-500/10 text-red-500 text-[9px] px-1.5 py-0.5 rounded-md border border-red-500/20 font-bold uppercase">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
