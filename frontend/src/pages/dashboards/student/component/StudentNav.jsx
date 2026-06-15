import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  MessageSquare,
  Bookmark,
  BookOpen,
  Users,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "Messages", path: "/student/messages", icon: Bell },
  { label: "Events", path: "/student/events", icon: Calendar },
  // { label: "Bookmarks", path: "/student/bookmarks", icon: Bookmark },
  { label: "Notifications", path: "/student/notifications", icon: MessageSquare },
  { label: "Timetable", path: "/student/timetable", icon: Clock },
  { label: "Academic", path: "/student/academic", icon: BookOpen },
  { label: "Clubs", path: "/student/clubs", icon: Users },
  { label: "Settings", path: "/student/settings", icon: Settings },
];

export default function StudentNav({ collapsed, onToggle, isOpen, setIsOpen, isMobile }) {
  const location = useLocation();
  const brandCollapsed = collapsed && !isMobile;

  return (
    <>
      {isMobile && (
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
      )}

      <motion.aside
        initial={false}
        animate={
          isMobile
            ? isOpen ? "open" : "closed"
            : { width: collapsed ? 64 : 240 }
        }
        variants={isMobile ? { open: { x: 0 }, closed: { x: "-100%" } } : undefined}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full bg-neutral-900 border-r border-neutral-800 z-50 flex flex-col overflow-hidden ${
          isMobile ? "w-64" : ""
        }`}
      >
        {/* Brand */}
        <div className="flex items-center h-16 px-4 border-b border-neutral-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-neutral-200" />
          </div>
          {!brandCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 text-sm font-semibold text-neutral-200"
            >
              UniNotify
            </motion.span>
          )}
          <div className="ml-auto">
            {isMobile ? (
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-neutral-800 rounded-lg">
                <X size={16} className="text-neutral-400" />
              </button>
            ) : (
              <button onClick={onToggle} className="p-1.5 hover:bg-neutral-800 rounded-lg">
                {collapsed ? (
                  <ChevronRight size={16} className="text-neutral-400" />
                ) : (
                  <ChevronLeft size={16} className="text-neutral-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* User section */}
        {!brandCollapsed && (
          <div className="px-4 py-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-300">
                U
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-200 truncate">Student</div>
                <div className="text-xs text-neutral-500">student@ur.ac.rw</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-800 text-neutral-200"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!brandCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        {!brandCollapsed && (
          <div className="px-3 py-3 border-t border-neutral-800">
            <div className="text-[11px] text-neutral-600 text-center">
              v1.0.0
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
