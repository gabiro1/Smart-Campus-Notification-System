import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  Bell,
  Activity,
  Users,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const guildItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/guild/overview" },
  { icon: Megaphone, label: "Post Events", path: "/guild/post-events" },
  { icon: Bell, label: "Notifications", path: "/guild/notifications" },
  { icon: Activity, label: "Engagement", path: "/guild/engagement" },
  { icon: Users, label: "Members", path: "/guild/members" },
];

export default function GuildSidebar(props) {
  return (
    <Sidebar
      {...props}
      menuItems={guildItems}
      width="w-20"
      brand={
        <button className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/[0.04] transition-all group">
          <div className="w-9 h-9 flex-shrink-0 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            G
          </div>
          <div className="hidden md:flex flex-col items-start ml-3">
            <span className="text-sm font-bold text-white tracking-tight">Guild Portal</span>
            <span className="text-[10px] text-blue-400/80 font-medium">President Dashboard</span>
          </div>
          <div className="hidden md:flex flex-col gap-1 text-neutral-600 group-hover:text-neutral-400 ml-auto">
            <ChevronUp size={12} className="-mb-1" />
            <ChevronDown size={12} />
          </div>
        </button>
      }
    />
  );
}
