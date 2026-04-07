import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import {
  Globe,
  CheckSquare,
  Radio,
  BarChart3,
  Users,
  Files,
  PieChart,
  GraduationCap,
} from "lucide-react";

const routes = [
  { path: "/dean/dashboard", name: "College Overview", icon: Globe },
  {
    path: "/dean/approvals",
    name: "HoD Approvals",
    icon: CheckSquare,
    badge: 5,
  },
  { path: "/dean/broadcast", name: "College Broadcast", icon: Radio },
  { path: "/dean/analytics", name: "Analytics", icon: BarChart3 },
  { path: "/dean/roles", name: "Role Management", icon: Users },
  { path: "/dean/announcements", name: "All Announcements", icon: Files },
  { path: "/dean/reports", name: "Reports", icon: PieChart },
];

export default function DeanSidebar(props) {
  return (
    <Sidebar
      {...props}
      menuItems={routes}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GraduationCap size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">University</h2>
            <p className="text-[10px] text-blue-400/80 uppercase tracking-wider font-semibold">Dean Portal</p>
          </div>
        </div>
      }
    />
  );
}
