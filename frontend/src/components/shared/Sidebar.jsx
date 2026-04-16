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
  width = "w-72",
  widthMobile = "w-20",
  bgClass = "bg-card/95 backdrop-blur-3xl",
  showCloseButton = true,
}) {
  const sidebarContent = (
    <div className={`flex flex-col h-full ${bgClass} border-r border-slate-700 ${isMobile ? widthMobile : width}`}>
      {/* Brand Header */}
      <div className={`h-16 flex items-center justify-between ${isMobile ? 'px-3 justify-center' : 'px-6'} border-b border-slate-700 shrink-0`}>
        {isMobile ? (
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Command size={20} />
          </div>
        ) : (
          <>
            {brand || (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
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
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-4 ${isMobile ? 'px-2 space-y-2' : 'px-3 space-y-1'} custom-scrollbar`}>
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 ${isMobile ? 'px-2 py-3 justify-center' : 'px-3 py-2.5 rounded-xl'} transition-all group relative ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={isMobile ? 22 : 20} className={isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : ""} />
                {!isMobile && <span className="flex-1 text-sm">{item.label}</span>}
                {item.badge && !isMobile && (
                  <span className="bg-white text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer (Profile, Settings, etc.) */}
      {footer && <div className="p-4 border-t border-slate-700 shrink-0">{footer}</div>}
    </div>
  );

  // On mobile, render as fixed icon-only sidebar (always visible, no drawer)
  if (isMobile) {
    return (
      <aside className="fixed left-0 top-0 h-screen z-30">
        {sidebarContent}
      </aside>
    );
  }

  // Desktop: always visible fixed sidebar
  return (
    <aside className="fixed left-0 top-0 h-screen z-30">{sidebarContent}</aside>
  );
}
