import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Radio,
  BarChart3,
  Settings,
  Activity,
  Database,
  Headset,
  Scale,
  LogOut,
  GraduationCap,
  Zap,
  Bell,
  X,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const coreItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/overview" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications", badge: 3, badgeType: 'red' },
  { icon: Radio, label: "Events", path: "/admin/events" },
];

const managementItems = [
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: GraduationCap, label: "Academic", path: "/admin/academic" },
  { icon: Scale, label: "Governance", path: "/admin/governance" },
];

const analyticsItems = [
  { icon: BarChart3, label: "Reports", path: "/admin/analytics" },
  { icon: Zap, label: "SMS Test", path: "/admin/sms-test" },
];

const systemItems = [
  { icon: Settings, label: "Settings", path: "/admin/settings" },
  { icon: Database, label: "Maintenance", path: "/admin/maintenance" },
  { icon: Headset, label: "Help Center", path: "/admin/support" },
];

export default function AdminSidebar({ isOpen, setIsOpen, isMobile, collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // All menu items with dividers
  const allItems = [
    ...coreItems,
    { divider: true, label: "Management" },
    ...managementItems,
    { divider: true, label: "Analytics" },
    ...analyticsItems,
    { divider: true, label: "System" },
    ...systemItems,
  ];

  // Mobile: Drawer overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Icon-Only Sidebar (always visible) */}
        <aside className="fixed left-0 top-0 h-screen z-30 w-16 bg-card border-r border-border flex flex-col">
          {/* Brand */}
          <div className="h-14 flex items-center justify-center border-b border-border shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="flex-1 py-2 px-1 space-y-1 overflow-y-auto custom-scrollbar">
            {allItems.map((item, idx) => {
              if (item.divider) return null;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-center relative transition-all ${
                    isActive
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon size={18} />
                  {item.badge && (
                    <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 ${
                      item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-border shrink-0 space-y-1">
            <button
              onClick={() => navigate("/admin/settings")}
              className="w-full p-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
                {user?.name?.charAt(0) || 'A'}
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

        {/* Mobile Drawer Overlay */}
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

        {/* Mobile Full Menu Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen z-50 w-72 bg-card border-r border-border flex flex-col"
            >
              {/* Header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <LayoutDashboard size={16} />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-semibold text-foreground leading-tight">Smart Campus</h2>
                    <p className="text-[10px] text-muted-foreground">Notification System</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
                {allItems.map((item, idx) => {
                  if (item.divider) {
                    return (
                      <div key={`div-${idx}`} className="px-3 pt-4 pb-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                      </div>
                    );
                  }
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[13px] ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon size={18} className="shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-border shrink-0 space-y-1">
                <button
                  onClick={() => navigate(`/admin/users?userId=${user?._id || user?.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[12px] font-medium text-foreground">{user?.name || 'Admin'}</p>
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

  // Desktop: Full sidebar with labels
  return (
    <aside className={`fixed left-0 top-0 h-screen z-30 bg-card border-r border-border flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-56'}`}>
      {/* Brand */}
      <div className={`h-14 flex items-center border-b border-border shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
            <LayoutDashboard size={16} />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-[13px] font-semibold text-foreground leading-tight">Smart Campus</h2>
              <p className="text-[10px] text-muted-foreground">Notification System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-3 custom-scrollbar ${collapsed ? 'px-1' : 'px-2'}`}>
        {allItems.map((item, idx) => {
          if (item.divider) {
            return (
              <div key={`div-${idx}`} className={`pt-4 pb-1 ${collapsed ? 'px-1' : 'px-3'}`}>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
              </div>
            );
          }
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-[13px] mb-0.5 ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${
                isActive
                  ? "bg-blue-500/10 text-blue-500 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-border shrink-0 space-y-1 ${collapsed ? 'px-1' : ''}`}>
        <button
          onClick={() => navigate("/admin/settings")}
          className={`w-full flex items-center gap-3 py-2 rounded-lg hover:bg-accent transition-all ${collapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-[12px] font-medium text-foreground truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate">Administrator</p>
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors text-[13px] ${collapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
