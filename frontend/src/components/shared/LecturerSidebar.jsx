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
} from "lucide-react";
import messageService from "../../services/messageService";
import { useState, useEffect } from "react";

const mainRoutes = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/lecturer" },
  { icon: Users, label: "My Classes", path: "/lecturer/classes" },
  { icon: Megaphone, label: "Announcements", path: "/lecturer/announcements" },
  { icon: BarChart3, label: "Analytics", path: "/lecturer/analytics" },
];

const commRoutes = [
  { icon: Mail, label: "Messages", path: "/lecturer/messages", id: "messages" },
  { icon: Bell, label: "Notifications", path: "/lecturer/notifications", id: "notifications" },
];

export default function LecturerSidebar(props) {
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await messageService.getUnreadCount();
        setUnreadMessages(data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [...mainRoutes, ...commRoutes.map(r => ({...r, badge: r.id === 'messages' ? unreadMessages : undefined}))];

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
    />
  );
}
