import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  Globe,
  CheckSquare,
  Radio,
  Users,
  Files,
  GraduationCap,
  MessageSquare,
  Settings,
  LogOut,
  Activity,
  Shield,
  UserCheck,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useNavigate } from "react-router-dom";

const navSections = [
  {
    label: "Operations",
    items: [
      { path: "/dean/dashboard", label: "School Overview", icon: Activity },
      { path: "/dean/approvals", label: "HoD Approvals", icon: CheckSquare },
      { path: "/dean/broadcast", label: "School Broadcast", icon: Radio },
    ],
  },
  {
    label: "Communication",
    items: [
      { path: "/dean/announcements", label: "All Announcements", icon: Files },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/dean/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function DeanSidebar(props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = navSections.flatMap((section) => [
    { section: true, label: section.label },
    ...section.items.map(item => ({
      icon: item.icon,
      label: item.label,
      path: item.path,
    })),
  ]);

  return (
    <Sidebar
      {...props}
      menuItems={menuItems}
      brand={
        <div className="flex items-center gap-3">
          <Logo to="/" />
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-wide">UniCore OS</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Dean Portal</p>
          </div>
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Dean'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'dean@university.edu'}</p>
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
