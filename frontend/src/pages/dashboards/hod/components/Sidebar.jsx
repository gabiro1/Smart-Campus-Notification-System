import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Radio,
  Files,
  Users,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const routes = [
  { path: "/hod", name: "Overview", icon: LayoutDashboard },
  { path: "/hod/approvals", name: "Approvals", icon: CheckSquare, badge: 3 },
  { path: "/hod/broadcast", name: "Broadcast", icon: Radio },
  { path: "/hod/announcements", name: "All Announcements", icon: Files },
  { path: "/hod/staff", name: "Manage Staff", icon: Users },
  { path: "/hod/reports", name: "Reports", icon: BarChart3 },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0a0a]/95 backdrop-blur-3xl border-r border-white/10 w-64 md:w-64">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
            CS
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Computer Science
            </h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
              HoD Portal
            </p>
          </div>
        </div>
        <button
          className="md:hidden text-neutral-400"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-4 px-2 font-semibold">
          Menu
        </p>
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === "/hod"}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `
              flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative
              ${isActive ? "bg-white/5 text-white" : "text-neutral-400 hover:bg-white/[0.02] hover:text-neutral-200"}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                  />
                )}
                <div className="flex items-center gap-3">
                  <route.icon
                    size={18}
                    className={
                      isActive
                        ? "text-blue-400"
                        : "group-hover:text-neutral-300"
                    }
                  />
                  <span className="text-sm font-medium">{route.name}</span>
                </div>
                {route.badge && (
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                    {route.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <NavLink
          to="/hod/settings"
          className="flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white rounded-xl transition-colors"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
