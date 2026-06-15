import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Bookmark,
  MessageSquare,
  Clock,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Rss } from "lucide-react";
import Logo from "../ui/Logo";

const sections = [
  {
    label: "Main",
    items: [
      { path: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/student/messages", label: "Messages", icon: Bell },
      { path: "/student/events", label: "Events", icon: Calendar },
      // { path: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
    ],
  },
  {
    label: "Community",
    items: [
      { path: "/student/feed", label: "Feed", icon: Rss },
      { path: "/student/questions", label: "Questions", icon: HelpCircle },
    ],
  },
  {
    label: "Updates",
    items: [
      { path: "/student/notifications", label: "Notifications", icon: MessageSquare },
      { path: "/student/reminders", label: "Reminders", icon: Clock },
    ],
  },
  {
    label: "Resources",
    items: [
      { path: "/student/timetable", label: "Timetable", icon: Clock },
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/student/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function StudentSidebar({ collapsed, onToggleCollapse, ...props }) {
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Student Portal</p>
            </div>
          )}
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-xl bg-accent`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || "S"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || "Student"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2'} rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all text-[13px]`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      }
    />
  );
}
