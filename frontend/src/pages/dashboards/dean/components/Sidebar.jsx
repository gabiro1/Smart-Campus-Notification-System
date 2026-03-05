import { NavLink } from "react-router-dom";
import {
  Globe,
  CheckSquare,
  Radio,
  BarChart3,
  Users,
  Files,
  PieChart,
  Settings,
  X,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const routes = [
  { path: "/dean", name: "College Overview", icon: Globe },
  {
    path: "/dean/approvals",
    name: "HoD Approvals",
    icon: CheckSquare,
    badge: 5,
  },
  { path: "/dean/broadcast", name: "College Broadcast", icon: Radio },
  { path: "/dean/analytics", name: "Analytics", icon: BarChart3 },
  { path: "/dean/roles", name: "Role Management", icon: Users },
  { path: "/dean/announcements", name: "All Announcements", icon: Files },
  { path: "/dean/reports", name: "Reports", icon: PieChart },
];

export default function Sidebar({ isOpen, setIsOpen, isMobile }) {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0a0a]/95 backdrop-blur-3xl border-r border-white/10 w-64">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GraduationCap size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              University
            </h2>
            <p className="text-[10px] text-blue-400/80 uppercase tracking-wider font-semibold">
              Dean Portal
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            className="text-neutral-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-4 px-2 font-bold">
          Administration
        </p>
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === "/dean"}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) => `
              flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 relative group
              ${isActive ? "bg-white/10 text-white shadow-sm" : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="deanNav"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
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
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                    {route.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Settings */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <NavLink
          to="/dean/settings"
          className="flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white rounded-xl transition-colors hover:bg-white/[0.04]"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">College Settings</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50">
        {sidebarContent}
      </aside>
      <AnimatePresence>
        {isMobile && isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
