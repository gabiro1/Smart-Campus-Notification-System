import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  Megaphone,
  Scale,
  Headphones,
  Mail,
  Bell,
  Settings,
  LogOut,
  Command,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const mainItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/lecturer/console" },
  { icon: PlusCircle, label: "Create", path: "/lecturer/create" },
  { icon: Users, label: "My Classes", path: "/lecturer/classes" },
  { icon: Megaphone, label: "Announcements", path: "/lecturer/announcements" },
  { icon: MessageCircle, label: "Q&A", path: "/lecturer/qa" },
  { icon: Calendar, label: "My Events", path: "/lecturer/events" },
];

const academicItems = [
  { icon: Scale, label: "Governance", path: "/lecturer/governance" },
];

const communicationItems = [
  { icon: Mail, label: "Messages", path: "/lecturer/messages" },
  { icon: Bell, label: "Notifications", path: "/lecturer/notifications" },
];

const systemItems = [
  { icon: Headphones, label: "Support", path: "/lecturer/support" },
  { icon: Settings, label: "Settings", path: "/lecturer/settings" },
];

export default function LecturerSidebar({ collapsed = false, onToggle, isOpen, setIsOpen, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCollapsed = collapsed || isTablet;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderNavItem = (item, isCollapsed) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    
    return (
      <button
        onClick={() => {
          navigate(item.path);
          setIsOpen?.(false);
        }}
        className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg transition-all text-[13px] group ${
          isActive
            ? "bg-primary/15 text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        <item.icon size={16} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
        {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
      </button>
    );
  };

  const renderNavGroup = (title, items, isCollapsed) => (
    <div className="space-y-0.5">
      {!isCollapsed && (
        <div className="px-2.5 pt-3 pb-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
      )}
      {items.map((item, idx) => (
        <div key={item.path || idx}>
          {renderNavItem(item, isCollapsed)}
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <aside className="fixed left-0 top-0 h-screen z-30 w-14 bg-card border-r border-border flex flex-col">
          <div className="h-14 flex items-center justify-center border-b border-border shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Command size={16} />
            </div>
          </div>

          <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto custom-scrollbar">
            {[...mainItems, ...academicItems, ...communicationItems, ...systemItems].map((item, idx) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen?.(false);
                  }}
                  className={`w-full p-2 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon size={16} />
                </button>
              );
            })}
          </nav>

          <div className="p-1.5 border-t border-border shrink-0 space-y-0.5">
            <button
              onClick={() => navigate("/lecturer/settings")}
              className="w-full p-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-semibold">
                {user?.name?.charAt(0) || 'L'}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
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
              onClick={() => setIsOpen?.(false)}
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
              className="fixed left-0 top-0 h-screen z-50 w-64 bg-card border-r border-border flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Command size={16} />
                  </div>
                  <div>
                    <h2 className="text-[13px] font-semibold text-foreground leading-tight">UniCore</h2>
                    <p className="text-[10px] text-muted-foreground">Lecturer Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen?.(false)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3 custom-scrollbar">
                {renderNavGroup("Main", mainItems, false)}
                {renderNavGroup("Academic", academicItems, false)}
                {renderNavGroup("Communication", communicationItems, false)}
                {renderNavGroup("System", systemItems, false)}
              </nav>

              <div className="p-3 border-t border-border shrink-0">
                <button
                  onClick={() => navigate("/lecturer/settings")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[12px] font-semibold">
                    {user?.name?.charAt(0) || 'L'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground">Lecturer</p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors text-[13px] mt-1"
                >
                  <LogOut size={14} />
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
    <aside className={`fixed left-0 top-0 h-screen z-40 bg-card border-r border-border flex flex-col transition-all duration-200 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      <div className={`h-14 flex items-center border-b border-border shrink-0 ${isCollapsed ? 'justify-center px-1' : 'px-4'}`}>
        <button onClick={onToggle} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Command size={14} />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-[12px] font-semibold text-foreground leading-tight">UniCore</h2>
              <p className="text-[9px] text-muted-foreground">Lecturer Portal</p>
            </div>
          )}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto py-2 custom-scrollbar ${isCollapsed ? 'px-1' : 'px-2'}`}>
        {renderNavGroup("Main", mainItems, isCollapsed)}
        {renderNavGroup("Academic", academicItems, isCollapsed)}
        {renderNavGroup("Communication", communicationItems, isCollapsed)}
        {renderNavGroup("System", systemItems, isCollapsed)}
      </nav>

      <div className={`p-2 border-t border-border shrink-0 ${isCollapsed ? 'px-1' : ''}`}>
        <button
          onClick={() => navigate("/lecturer/settings")}
          className={`w-full flex items-center gap-2 py-1.5 rounded-lg hover:bg-accent transition-all ${isCollapsed ? 'justify-center px-1' : 'px-2'}`}
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-semibold shrink-0">
            {user?.name?.charAt(0) || 'L'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-[11px] font-medium text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-[9px] text-muted-foreground truncate">Lecturer</p>
            </div>
          )}
        </button>
        
        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors text-[12px] px-2 mt-0.5"
          >
            <LogOut size={14} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
