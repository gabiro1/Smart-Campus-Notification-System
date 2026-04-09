import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  Bell,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Mail,
  Command,
  PlusCircle,
  Scale,
  LogOut,
  Headphones,
} from "lucide-react";
import messageService from "../../services/messageService";
import notificationService from "../../services/notificationService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const mainRoutes = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/lecturer" },
  { icon: PlusCircle, label: "Create", path: "/lecturer/create" },
  { icon: Users, label: "My Classes", path: "/lecturer/classes" },
  { icon: Megaphone, label: "Announcements", path: "/lecturer/announcements" },
  { icon: BarChart3, label: "Analytics", path: "/lecturer/analytics" },
  { icon: Scale, label: "Governance", path: "/lecturer/governance" },
  { icon: Headphones, label: "Support", path: "/lecturer/support" },
];

const commRoutes = [
  { icon: Mail, label: "Messages", path: "/lecturer/messages", id: "messages" },
  { icon: Bell, label: "Notifications", path: "/lecturer/notifications", id: "notifications" },
];

const bottomRoutes = [
  { icon: Settings, label: "Settings", path: "/lecturer/settings" },
];

export default function LecturerSidebar(props) {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const [msgData, notifData] = await Promise.all([
          messageService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
          notificationService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
        ]);
        setUnreadMessages(msgData?.unreadCount || 0);
        setUnreadNotifications(notifData?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread counts:", error);
      }
    };
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    ...mainRoutes,
    ...commRoutes.map(r => ({
      ...r,
      badge: r.id === 'messages' ? unreadMessages : r.id === 'notifications' ? unreadNotifications : undefined
    })),
    ...bottomRoutes,
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Sidebar
      {...props}
      menuItems={menuItems}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">UniCore</h2>
            <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold">Lecturer</p>
          </div>
        </div>
      }
      footer={
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-sm"
        >
          <LogOut size={18} />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      }
    />
  );
}
