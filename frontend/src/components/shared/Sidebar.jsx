import { NavLink } from "react-router-dom";
import { X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Unified Sidebar component - consolidates 5 role-specific variants
 *
 * Features:
 * - Fixed positioning (desktop) or mobile drawer overlay
 * - Brand header with logo/text
 * - Navigation menu with icons and badges
 * - User profile section at bottom (optional)
 * - Responsive: mobile draws over content, desktop fixed left
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Mobile drawer open state
 * @param {function} props.setIsOpen - Mobile drawer toggle function
 * @param {boolean} props.isMobile - Whether currently in mobile viewport
 * @param {React.ReactNode} props.brand - Custom brand header content
 * @param {Array} props.menuItems - Navigation items: [{ icon, label, path, badge? }]
 * @param {React.ReactNode} props.footer - Optional footer (e.g., user profile)
 * @param {string} props.width - Desktop width (default "w-64")
 * @param {string} props.bgClass - Background class (default "bg-background/95")
 * @param {boolean} props.showCloseButton - Show X close button (mobile only)
 */
export default function Sidebar({
  isOpen,
  setIsOpen,
  isMobile,
  brand,
  menuItems = [],
  footer,
  width = "w-64",
  bgClass = "bg-background/95 backdrop-blur-3xl",
  showCloseButton = true,
}) {
  const sidebarContent = (
    <div className={`flex flex-col h-full ${bgClass} border-r border-white/10 ${width}`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        {brand || (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Command size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                UniCore OS
              </h2>
              <p className="text-[10px] text-blue-400/80 uppercase tracking-wider font-semibold">
                Portal
              </p>
            </div>
          </div>
        )}
        {isMobile && showCloseButton && (
          <button className="text-neutral-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""} />
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer (Profile, Settings, etc.) */}
      {footer && <div className="p-4 border-t border-white/5 shrink-0">{footer}</div>}
    </div>
  );

  // On mobile, render as an overlay drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: always visible fixed sidebar
  return (
    <aside className="fixed left-0 top-0 h-screen z-30">{sidebarContent}</aside>
  );
}
