import Sidebar from "./Sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Megaphone,
  Bell,
  Activity,
  Users,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Settings,
  LogOut,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
  PlusCircle,
  GraduationCap,
} from "lucide-react";
import Logo from "../ui/Logo";

const guildItems = [
  { icon: GraduationCap, label: "Student Dashboard", path: "/student/dashboard" },
  { icon: LayoutDashboard, label: "Overview", path: "/guild/overview" },
  { icon: ShieldCheck, label: "Event Moderation", path: "/guild/events" },
  { icon: PlusCircle, label: "Publish Event", path: "/guild/events/publish" },
  { icon: Megaphone, label: "Post Events", path: "/guild/post-events" },
  { icon: Bell, label: "Notifications", path: "/guild/notifications" },
  { icon: Activity, label: "Engagement", path: "/guild/engagement" },
  { icon: Users, label: "Members", path: "/guild/members" },
  { icon: UserCheck, label: "Class Reps", path: "/guild/class-reps" },
  { icon: MessageSquare, label: "Messages", path: "/guild/messages" },
  { icon: Settings, label: "Settings", path: "/guild/settings" },
];

export default function GuildSidebar(props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar
      {...props}
      menuItems={guildItems}
      width="w-72"
      brand={
        <div className="space-y-2">
          <Logo />
          <button className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-accent transition-all group">
            <div className="w-9 h-9 flex-shrink-0 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              {user?.name?.charAt(0) || 'G'}
            </div>
            <div className="hidden md:flex flex-col items-start ml-3">
              <span className="text-sm font-bold text-foreground tracking-tight">Guild Portal</span>
              <span className="text-[10px] text-blue-500/80 font-medium">President Dashboard</span>
            </div>
            <div className="hidden md:flex flex-col gap-1 text-muted-foreground group-hover:text-foreground ml-auto">
              <ChevronUp size={12} className="-mb-1" />
              <ChevronDown size={12} />
            </div>
          </button>
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Guild President'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'guild@university.edu'}</p>
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
