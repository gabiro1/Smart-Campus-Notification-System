import Sidebar from "./Sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Activity,
  Shield,
  Globe,
  LineChart,
  Users,
  Building,
  FileText,
  Database,
  Command,
  MessageSquare,
  LogOut,
  ClipboardCheck,
} from "lucide-react";

const routes = [
  { path: "/principal/dashboard", label: "System Overview", icon: Activity },
  { path: "/principal/admin", label: "Admin Overview", icon: Shield },
  { path: "/principal/departments", label: "Departments", icon: Building },
  { path: "/principal/reports", label: "Reports", icon: FileText },
  { path: "/principal/broadcast", label: "College Broadcast", icon: Globe },
  { path: "/principal/analytics", label: "System Analytics", icon: LineChart },
  { path: "/principal/audit", label: "Audit Logs", icon: ClipboardCheck },
  { path: "/principal/users", label: "All Users", icon: Users },
  { path: "/principal/backups", label: "Backups", icon: Database },
  { path: "/principal/approvals", label: "Approvals", icon: ClipboardCheck },
  { path: "/principal/messages", label: "Messages", icon: MessageSquare },
];

export default function PrincipalSidebar(props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = routes.map(item => ({
    icon: item.icon,
    label: item.label,
    path: item.path,
    badge: item.badge
  }));

  return (
    <Sidebar
      {...props}
      menuItems={menuItems}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-wide">UniCore OS</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Principal Node</p>
          </div>
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Principal'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'principal@university.edu'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-muted-foreground hover:text-error hover:bg-error/10 text-sm"
          >
            <LogOut size={16} />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      }
    />
  );
}