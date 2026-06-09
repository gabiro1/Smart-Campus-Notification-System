import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Logo from "../ui/Logo";
import { getRoleConfig } from "./navigationConfig";

export default function UniSidebar({
  isOpen,
  setIsOpen,
  isMobile,
  collapsed,
  onToggleCollapse,
  role = "student",
  user = {},
  unreadCount = 0,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const config = getRoleConfig(role);
  const { sections } = config;

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarWidth = collapsed ? 72 : 256;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className={`h-16 flex items-center border-b border-border shrink-0 ${collapsed ? "justify-center px-3" : "px-5"}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0">
            <Logo size="sm" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Uni<span className="text-blue-500">Notify</span>
                </h2>
                <p className="text-[10px] text-muted-foreground tracking-wide">{config.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isMobile && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-2 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                  {section.label}
                </span>
              </div>
            )}
            {section.items.map((item, iIdx) => {
              const active = isActive(item.path, item.end);
              return (
                <button
                  key={`${sIdx}-${iIdx}`}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile && setIsOpen) setIsOpen(false);
                  }}
                  className={`group relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                    collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                  } ${
                    active
                      ? "bg-blue-500/10 text-blue-400 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  {active && !collapsed && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative shrink-0 ${active ? "text-blue-400" : "text-muted-foreground group-hover:text-foreground"}`}>
                    <item.icon size={collapsed ? 20 : 18} />
                  </div>
                  {!collapsed && (
                    <span className="flex-1 text-left text-[13px] truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`border-t border-border shrink-0 ${collapsed ? "p-2" : "p-3"}`}>
        <div className="space-y-1">
          <button
            onClick={() => navigate(`/${role}/settings`)}
            className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
              collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
            } hover:bg-white/[0.04]`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || role.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-xs font-medium text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{config.roleLabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
              collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
            } text-muted-foreground hover:text-red-400 hover:bg-red-500/10`}
          >
            <LogOut size={collapsed ? 18 : 16} className="shrink-0" />
            {!collapsed && <span className="text-[13px]">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop permanent sidebar
  if (!isMobile) {
    return (
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed left-0 top-0 h-screen z-30 bg-[#0a0a0a] border-r border-border overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>
    );
  }

  // Mobile: no permanent sidebar, only animated drawer with staggered items
  const mobileSidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="h-16 flex items-center px-5 border-b border-border shrink-0"
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Uni<span className="text-blue-500">Notify</span>
            </h2>
            <p className="text-[10px] text-muted-foreground tracking-wide">{config.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-2 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + sIdx * 0.04, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="px-3 pb-1"
            >
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                {section.label}
              </span>
            </motion.div>
            {section.items.map((item, iIdx) => {
              const active = isActive(item.path, item.end);
              const itemIndex = sIdx * 10 + iIdx;
              return (
                <motion.div
                  key={`${sIdx}-${iIdx}`}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.12 + itemIndex * 0.035,
                    duration: 0.35,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  <button
                    onClick={() => {
                      navigate(item.path);
                      if (setIsOpen) setIsOpen(false);
                    }}
                    className={`group relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 px-3 py-2.5 ${
                      active
                        ? "bg-blue-500/10 text-blue-400 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`relative shrink-0 ${active ? "text-blue-400" : "text-muted-foreground group-hover:text-foreground"}`}>
                      <item.icon size={18} />
                    </div>
                    <span className="flex-1 text-left text-[13px] truncate">{item.label}</span>
                    {item.badge && unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="border-t border-border shrink-0 p-3"
      >
        <div className="space-y-1">
          <button
            onClick={() => navigate(`/${role}/settings`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || role.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{config.roleLabel}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="text-[13px]">Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed left-0 top-0 h-screen z-50 w-72 bg-[#0a0a0a] border-r border-border flex flex-col rounded-r-2xl"
          >
            {mobileSidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
