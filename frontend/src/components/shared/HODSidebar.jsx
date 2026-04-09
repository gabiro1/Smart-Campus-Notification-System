import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Files,
  Users,
  BarChart3,
  Settings,
  Command,
  Mail,
  Bell,
  Scale,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import messageService from "../../services/messageService";
import notificationService from "../../services/notificationService";
import governanceService from "../../services/governanceService";

export default function HODSidebar(props) {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [msgData, notifData, pendingData] = await Promise.all([
          messageService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
          notificationService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
          governanceService.getPending().catch(() => ({ count: 0 })),
        ]);
        setUnreadMessages(msgData?.unreadCount || 0);
        setUnreadNotifications(notifData?.unreadCount || 0);
        setPendingCount(pendingData?.count || 0);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const routes = [
    { path: "/hod", name: "Overview", icon: LayoutDashboard },
    { path: "/hod/governance", name: "Governance", icon: Scale, badge: pendingCount > 0 ? pendingCount : undefined },
    { path: "/hod/broadcast", name: "Broadcast", icon: Radio },
    { path: "/hod/announcements", name: "All Announcements", icon: Files },
    { path: "/hod/lecturers", name: "Lecturer Management", icon: Users },
  ];

  const menuItems = routes.map(r => ({
    ...r,
    label: r.name,
    badge: r.badge
  })).concat([
    { icon: Mail, label: "Messages", path: "/hod/messages", id: "messages", badge: unreadMessages > 0 ? unreadMessages : undefined },
    { icon: Bell, label: "Notifications", path: "/hod/notifications", id: "notifications", badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { icon: BarChart3, label: "Reports", path: "/hod/reports" },
    { icon: Settings, label: "Settings", path: "/hod/settings" },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const deptName = user?.department?.name || user?.department || "Department";

  return (
    <Sidebar
      {...props}
      menuItems={menuItems}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">{deptName}</h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">HoD Portal</p>
          </div>
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
              {user?.name?.charAt(0) || 'H'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'HoD'}</p>
              <p className="text-[10px] text-neutral-500 truncate">Head of Department</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-sm"
          >
            <LogOut size={16} />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      }
    />
  );
}
