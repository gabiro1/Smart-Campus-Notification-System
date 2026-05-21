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
  Gauge,
  Activity,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import messageService from "../../services/messageService";
import notificationService from "../../services/notificationService";
import governanceService from "../../services/governanceService";

export default function HODSidebar({ collapsed, onToggleCollapse, ...props }) {
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
          governanceService.getPending().catch(() => ({ count: 0, data: [] })),
        ]);
        setUnreadMessages(msgData?.unreadCount || 0);
        setUnreadNotifications(notifData?.unreadCount || 0);
        const pendingItems = Array.isArray(pendingData) ? pendingData : pendingData?.data || [];
        setPendingCount(pendingItems.length || 0);
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

  const sections = [
    {
      section: "Operations Center",
      items: [
        { path: "/hod/dashboard", name: "Command Center", icon: Gauge },
        { path: "/hod/governance", name: "Approvals", icon: Scale, badge: pendingCount > 0 ? pendingCount : undefined },
      ],
    },
    {
      section: "Communications",
      items: [
        { path: "/hod/broadcast", name: "Broadcast", icon: Radio },
        { path: "/hod/announcements", name: "Announcements", icon: Files },
        { path: "/hod/messages", name: "Messages", icon: Mail, badge: unreadMessages > 0 ? unreadMessages : undefined },
      ],
    },
    {
      section: "Management",
      items: [
        { path: "/hod/lecturers", name: "Lecturers", icon: Users },
        { path: "/hod/reports", name: "Analytics", icon: BarChart3 },
      ],
    },
    {
      section: "System",
      items: [
        { path: "/hod/notifications", name: "Notifications", icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined },
        { path: "/hod/settings", name: "Settings", icon: Settings },
      ],
    },
  ];

  const menuItems = sections.flatMap(s => [
    { section: true, label: s.section },
    ...s.items,
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
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      {...props}
      menuItems={menuItems}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Command size={16} />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-wide">{deptName}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Command Center</p>
            </div>
          )}
        </div>
      }
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name?.charAt(0) || 'H'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'HoD'}</p>
              <p className="text-[10px] text-muted-foreground truncate">Head of Department</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-muted-foreground hover:text-red-400 hover:bg-red-500/10 text-sm"
          >
            <LogOut size={16} />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      }
    />
  );
}
