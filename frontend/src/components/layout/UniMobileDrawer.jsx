import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bell,
  Calendar,
  Megaphone,
  Users,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Activity,
  ClipboardList,
  X,
} from "lucide-react";
import Logo from "../ui/Logo";
import { getRoleConfig } from "./navigationConfig";

const drawerVariants = {
  closed: {
    x: "-100%",
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  open: {
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 250 },
  },
};

const overlayVariants = {
  closed: { opacity: 0, transition: { duration: 0.2 } },
  open: { opacity: 1, transition: { duration: 0.2 } },
};

const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, type: "spring", stiffness: 200, damping: 25 },
  }),
};

export default function UniMobileDrawer({ isOpen, onClose, role = "student", user = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const config = getRoleConfig(role);

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    onClose();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.aside
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 h-full z-50 w-[80%] max-w-[300px] bg-[#0a0a0a] border-r border-border flex flex-col rounded-r-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Logo size="sm" to="/" />
                <div>
                  <h2 className="text-sm font-bold text-foreground leading-tight">
                    UniNotify
                  </h2>
                  <p className="text-[10px] text-muted-foreground">{config.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>

            {/* User Card */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {config.roleLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-3 custom-scrollbar">
              {config.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-0.5">
                  <div className="px-3 py-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                      {section.label}
                    </span>
                  </div>
                  {section.items.map((item, iIdx) => {
                    const active = isActive(item.path, item.end);
                    const globalIdx = sIdx * 10 + iIdx;
                    return (
                      <motion.button
                        key={item.path}
                        custom={globalIdx}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] ${
                          active
                            ? "bg-blue-500/10 text-blue-400 font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                        }`}
                      >
                        <item.icon size={18} className="shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-border shrink-0 p-3 space-y-1">
              <button
                onClick={() => handleNavigate(`/${role}/settings`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all text-[13px]"
              >
                <Settings size={16} className="shrink-0" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all text-[13px]"
              >
                <LogOut size={16} className="shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
