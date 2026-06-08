import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  Globe,
  BarChart3,
  Shield,
  Users,
  Calendar,
  PlusCircle,
  GraduationCap,
  LogOut,
  UserCheck,
  Vote,
} from "lucide-react";
import Logo from "../ui/Logo";

const sections = [
  {
    label: "Overview",
    items: [
      { path: "/principal/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Governance",
    items: [
      { path: "/principal/approvals", label: "Approvals", icon: ShieldAlert },
      { path: "/principal/departments", label: "Departments", icon: Building2 },
      { path: "/principal/reports-analytics", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { path: "/principal/role-assignments", label: "Role Assignments", icon: Shield },
      { path: "/principal/student-leadership", label: "Student Leadership", icon: Users },
    ],
  },
  {
    label: "Communication",
    items: [
      { path: "/principal/broadcast", label: "Broadcast Center", icon: Globe },
    ],
  },
  {
    label: "Events",
    items: [
      { path: "/principal/my-events", label: "My Events", icon: Calendar },
      { path: "/principal/events/create", label: "Create Event", icon: PlusCircle },
    ],
  },
];

export default function PrincipalSidebar({ collapsed, onToggleCollapse, ...props }) {
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
          <Logo />
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-wide">UniNotify</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Principal Console</p>
            </div>
          )}
        </div>
      }
      footer={
        <div className={collapsed ? "space-y-2" : "space-y-2"}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-xl bg-accent`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || "P"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "Principal"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || "principal@university.edu"}
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
