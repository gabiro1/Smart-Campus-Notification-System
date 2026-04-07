import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import {
  Activity,
  Shield,
  Globe,
  LineChart,
  Users,
  Settings,
  Wrench,
  Command,
} from "lucide-react";

const routes = [
  { path: "/principal", name: "System Overview", icon: Activity },
  { path: "/principal/admin", name: "Admin Panel", icon: Shield, badge: "2" },
  { path: "/principal/broadcast", name: "Global Broadcast", icon: Globe },
  { path: "/principal/analytics", name: "System Analytics", icon: LineChart },
  { path: "/principal/users", name: "All Users", icon: Users },
  { path: "/principal/settings", name: "System Settings", icon: Settings },
  { path: "/principal/maintenance", name: "Maintenance", icon: Wrench },
];

export default function PrincipalSidebar(props) {
  return (
    <Sidebar
      {...props}
      menuItems={routes}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">UniCore OS</h2>
            <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold">Principal Node</p>
          </div>
        </div>
      }
    />
  );
}
