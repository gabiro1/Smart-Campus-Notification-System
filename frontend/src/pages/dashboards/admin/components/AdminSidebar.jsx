import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../../components/shared/Sidebar";
import messageService from "../../../../services/messageService";
import notificationService from "../../../../services/notificationService";
import {
  LayoutDashboard,
  Users,
  Radio,
  BarChart3,
  Search,
  Settings,
  Activity,
  Database,
  Headset,
  Mail,
  Scale,
  LogOut,
  BookOpen,
  GraduationCap,
  Zap,
} from "lucide-react";

const coreItems = [
  { icon: LayoutDashboard, label: "System Overview", path: "/admin/overview" },
  { icon: Users, label: "Access Control", path: "/admin/users" },
  { icon: GraduationCap, label: "Academic Structure", path: "/admin/academic" },
  { icon: Radio, label: "Event Management", path: "/admin/events" },
  { icon: BarChart3, label: "Full Analytics", path: "/admin/analytics" },
];

const systemItems = [
  { icon: Activity, label: "Maintenance", path: "/admin/maintenance" },
  { icon: Database, label: "Backups", path: "/admin/backups" },
  { icon: Zap, label: "SMS Test", path: "/admin/sms-test" },
];

const bottomItems = [
  { icon: Settings, label: "Core Settings", path: "/admin/settings" },
  { icon: Headset, label: "Help Center", path: "/admin/support" },
  { icon: Mail, label: "Messages", path: "/admin/messages" },
  { icon: Scale, label: "Governance", path: "/admin/governance" },
];

export default function AdminSidebar({ isOpen, setIsOpen, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [msgData, notifData] = await Promise.all([
          messageService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
          notificationService.getUnreadCount().catch(() => ({ unreadCount: 0 })),
        ]);
        setUnreadMessages(msgData?.unreadCount || 0);
        setUnreadNotifications(notifData?.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    ...coreItems.map(item => ({
      ...item,
      active: location.pathname === item.path || location.pathname.startsWith(item.path)
    })),
    ...systemItems.map(item => ({
      ...item,
      active: location.pathname === item.path
    })),
    ...bottomItems.map(item => ({
      ...item,
      active: location.pathname === item.path,
      badge: item.path === "/admin/messages" && unreadMessages > 0 ? unreadMessages : undefined
    }))
  ];

  return (
    <Sidebar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isMobile={isMobile}
      brand={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-wide">UniCore OS</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</p>
          </div>
        </div>
      }
      menuItems={menuItems.map(item => ({
        icon: item.icon,
        label: item.label,
        path: item.path,
        badge: item.badge
      }))}
      footer={
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/admin/users?userId=${user?._id || user?.id}`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@university.edu'}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm"
          >
            <LogOut size={16} />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      }
    />
  );
}