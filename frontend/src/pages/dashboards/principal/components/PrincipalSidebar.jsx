import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Send,
  CheckCircle2,
  Shield,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/principal/dashboard", icon: LayoutDashboard },
  { label: "Departments", path: "/principal/departments", icon: Building2 },
  { label: "Broadcast", path: "/principal/broadcast", icon: Send },
  { label: "Approvals", path: "/principal/approvals", icon: CheckCircle2 },
  { label: "Role Assignments", path: "/principal/role-assignments", icon: Shield },
  { label: "Student Leadership", path: "/principal/student-leadership", icon: Users },
  { label: "Events", path: "/principal/events", icon: Calendar },
  { label: "My Events", path: "/principal/my-events", icon: Calendar },
];

export default function PrincipalSidebar({ isOpen, setIsOpen, isMobile, collapsed, onToggle }) {
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  return (
    <>
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>
      )}

      <motion.aside
        initial={false}
        animate={
          isMobile
            ? isOpen
              ? "open"
              : "closed"
            : { width: collapsed ? 64 : 224 }
        }
        variants={isMobile ? sidebarVariants : undefined}
        className={`fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col overflow-hidden ${
          isMobile ? "w-56" : ""
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {(!collapsed || isMobile) && (
            <span className="font-bold text-lg text-foreground">Principal</span>
          )}
          {isMobile ? (
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-md">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={onToggle} className="p-1 hover:bg-muted rounded-md">
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.label === "Dashboard"}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
