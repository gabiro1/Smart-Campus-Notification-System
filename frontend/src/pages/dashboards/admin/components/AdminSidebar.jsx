import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bell,
  Radio,
  Users,
  Shield,
  Building2,
  Calendar,
  Scale,
  FileText,
  ScrollText,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Zap,
  Settings,
  Database,
  HardDrive,
  Headset,
  LogOut,
  User,
  X,
} from "lucide-react";
import Logo from "../../../../components/ui/Logo";
import notificationService from "../../../../services/notificationService";

const navSections = [
  {
    label: "Core",
    items: [
      { icon: LayoutDashboard, label: "Overview", path: "/admin/overview", end: true },
      { icon: Bell, label: "Notifications", path: "/admin/notifications", badge: true },
      { icon: Radio, label: "Events", path: "/admin/events" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Users, label: "Users", path: "/admin/users" },
      { icon: Shield, label: "Role Management", path: "/admin/roles" },
      { icon: Building2, label: "Academic Structure", path: "/admin/academic" },
      { icon: Calendar, label: "Timetable", path: "/admin/timetable" },
      { icon: Scale, label: "Governance", path: "/admin/governance" },
      { icon: FileText, label: "Role Assignments", path: "/admin/role-assignments" },
    ],
  },
  {
    label: "Administration",
    items: [
      { icon: User, label: "HR Accounts", path: "/admin/hr-accounts" },
      { icon: AlertTriangle, label: "Emergency Override", path: "/admin/emergency" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { icon: BarChart3, label: "Reports & Analytics", path: "/admin/analytics" },
      { icon: ClipboardList, label: "Audit Logs", path: "/admin/audit-logs" },
      { icon: Zap, label: "SMS Test", path: "/admin/sms-test" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Settings, label: "Core Settings", path: "/admin/settings" },
      { icon: Database, label: "Maintenance", path: "/admin/maintenance" },
      { icon: HardDrive, label: "Backups", path: "/admin/backups" },
      { icon: Headset, label: "Support Tickets", path: "/admin/support" },
    ],
  },
];

const allItems = navSections.flatMap((section) => [
  { divider: true, label: section.label },
  ...section.items,
]);

export default function AdminSidebar({ isOpen, setIsOpen, isMobile, collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await notificationService.getUnreadCount();
        setUnreadNotifications(data?.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const getBadgeCount = (item) => {
    if (item.badge && unreadNotifications > 0) return unreadNotifications;
    return undefined;
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  if (isMobile) {
    return (
      <>
        <aside className="fixed left-0 top-0 h-screen z-30 w-16 bg-card border-r border-border flex flex-col">
          <div className="h-14 flex items-center justify-center border-b border-border shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
          </div>

          <nav className="flex-1 py-2 px-1 space-y-1 overflow-y-auto custom-scrollbar">
            {allItems.map((item, idx) => {
              if (item.divider) return null;
              const active = isActive(item.path);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-center relative transition-all ${
                    active
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon size={18} />
                  {getBadgeCount(item) && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 bg-red-500 text-white">
                      {getBadgeCount(item) > 9 ? "9+" : getBadgeCount(item)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-2 border-t border-border shrink-0 space-y-1">
            <button
              onClick={() => navigate("/admin/settings")}
              className="w-full p-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
                {user?.name?.charAt(0) || "A"}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="w-full p-2.5 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen z-50 w-72 bg-card border-r border-border flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <Logo to="/" />
            <div>
              <h2 className="text-[13px] font-semibold text-foreground leading-tight">UniNotify</h2>
              <p className="text-[10px] text-muted-foreground">Admin Console</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X size={18} />
          </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
                {allItems.map((item, idx) => {
                  if (item.divider) {
                    return (
                      <div key={`div-${idx}`} className="px-3 pt-4 pb-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          {item.label}
                        </span>
                      </div>
                    );
                  }
                  const active = isActive(item.path);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[13px] ${
                        active
                          ? "bg-blue-500/10 text-blue-500 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon size={18} className="shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {getBadgeCount(item) && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                          {getBadgeCount(item)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-border shrink-0 space-y-1">
                <button
                  onClick={() => navigate(`/admin/users?userId=${user?._id || user?.id || ""}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[12px] font-medium text-foreground">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Administrator</p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors text-[13px]"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-30 bg-card border-r border-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      <div
        className={`h-14 flex items-center border-b border-border shrink-0 ${
          collapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Logo to="/" />
          {!collapsed && (
            <div>
              <h2 className="text-[13px] font-semibold text-foreground leading-tight">UniNotify</h2>
              <p className="text-[10px] text-muted-foreground">Admin Console</p>
            </div>
          )}
        </div>
      </div>

      <nav
        className={`flex-1 overflow-y-auto py-3 custom-scrollbar ${
          collapsed ? "px-1" : "px-2"
        }`}
      >
        {allItems.map((item, idx) => {
          if (item.divider) {
            return (
              <div
                key={`div-${idx}`}
                className={`pt-4 pb-1 ${collapsed ? "px-1" : "px-3"}`}
              >
                {!collapsed && (
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </span>
                )}
              </div>
            );
          }
          const active = isActive(item.path);
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-[13px] mb-0.5 ${
                collapsed ? "justify-center px-2" : "px-3"
              } ${
                active
                  ? "bg-blue-500/10 text-blue-500 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && getBadgeCount(item) && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  {getBadgeCount(item)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        className={`p-3 border-t border-border shrink-0 space-y-1 ${
          collapsed ? "px-1" : ""
        }`}
      >
        <button
          onClick={() => navigate("/admin/settings")}
          className={`w-full flex items-center gap-3 py-2 rounded-lg hover:bg-accent transition-all ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
            {user?.name?.charAt(0) || "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-[12px] font-medium text-foreground truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Administrator</p>
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors text-[13px] ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
