import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Radio,
  Files,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const routes = [
  { path: "/hod", name: "Overview", icon: LayoutDashboard },
  { path: "/hod/approvals", name: "Approvals", icon: CheckSquare, badge: 3 },
  { path: "/hod/broadcast", name: "Broadcast", icon: Radio },
  { path: "/hod/announcements", name: "All Announcements", icon: Files },
  { path: "/hod/lecturers", name: "Lecturer Management", icon: Users },
  { path: "/hod/staff", name: "Manage Staff", icon: Users },
  { path: "/hod/reports", name: "Reports", icon: BarChart3 },
];

export default function HODSidebar(props) {
  return (
    <Sidebar
      {...props}
      menuItems={routes}
      width="w-64"
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Computer Science</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">HoD Portal</p>
          </div>
        </div>
      }
    />
  );
}
