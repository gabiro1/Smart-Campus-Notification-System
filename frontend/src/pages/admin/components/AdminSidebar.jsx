import {
  LayoutDashboard,
  PlusCircle,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Headset,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const managementItems = [
  { icon: Search, label: "Search", path: "/admin/search" },
  { icon: LayoutDashboard, label: "Overview", path: "/admin/dashboard" },
  { icon: PlusCircle, label: "Create Event", path: "/admin/create" },
  { icon: Users, label: "Students", path: "/admin/users", badge: "New" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
];

// const communicationItems = [
//   { icon: Bell, label: "Notifications", path: "/admin/notifications" },
// ];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen bg-[#0D0D0D] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* 1. Clickable Header (Mirrors Kangaroo Inc Account Switcher) */}
      <div className="p-4">
        <button className="w-full flex items-center justify-between p-2  rounded-sm   shadow-2xl hover:bg-[#1A1A1A] transition-all group">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* <div className="w-9 h-9 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-bold border border-blue-500/20">
                U
              </div> */}
              {/* Online Indicator from reference image */}
              {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full" /> */}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-white tracking-tight">
                UniNotify AI
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                admin@university.edu
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
      <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar ">
        {/* Management Section */}
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-4 px-3">
            Management
          </p>
          {managementItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        {/* Visual Line Separator */}
        <div className="border-t border-white/5 mx-2" />

        {/* Upgrade Prompt Card */}
        <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-5 mb-4 mt-3">
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
      <div className="p-4 border-t border-white/5 space-y-1 bg-[#0D0D0D]">
        <button className="flex items-center gap-3 p-2 pl-4 text-neutral-500 hover:text-white w-full transition-colors rounded-sm hover:bg-white/[0.03]">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="flex items-center gap-3 p-2 pl-4   text-neutral-500 hover:text-white w-full transition-colors rounded-sm hover:bg-white/[0.03] mt-1">
          <Headset size={18} />
          <span className="text-sm font-medium">Help Center</span>
        </button>
      </div>
    </aside>
  );
}

// Sub-component for clean code
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
      {item.badge && (
        <span className="bg-blue-500/10 text-blue-500 text-[9px] px-1.5 py-0.5 rounded-md border border-blue-500/20 font-bold uppercase">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
