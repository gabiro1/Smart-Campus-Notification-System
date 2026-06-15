import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  GitBranch,
  Calendar,
  PlusCircle,
  Users,
  LogOut,
} from "lucide-react";
import Logo from "../ui/Logo";

const sections = [
  {
    label: "Overview",
    items: [
      { path: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "HR Operations",
    items: [
      { path: "/hr/drafts", label: "HR Workflow", icon: GitBranch },
    ],
  },
  {
    label: "Events",
    items: [
      { path: "/hr/events", label: "Events", icon: Calendar },
      { path: "/hr/events/create", label: "Create Event", icon: PlusCircle },
    ],
  },
];

export default function HrSidebar({ collapsed, onToggleCollapse, ...props }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = sections.flatMap((section) => [
    { section: true, label: section.label },
    ...section.items.map((item) => ({
      icon: item.icon,
      label: item.label,
      path: item.path,
    })),
  ]);

  return (
    <Sidebar
      {...props}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      menuItems={menuItems}
      brand={
        <div className="flex items-center gap-3">
          <Logo to="/" />
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-wide">UniNotify</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">HR Console</p>
            </div>
          )}
        </div>
      }
      footer={
        <div className={collapsed ? "space-y-2" : "space-y-2"}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-xl bg-accent`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || "H"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "HR Officer"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || "hr@university.edu"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all text-muted-foreground hover:text-error hover:bg-error/10 text-sm`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Sign Out</span>}
          </button>
        </div>
      }
    />
  );
}
