import { NavLink } from "react-router-dom";
import { X, Bell } from "lucide-react";

/**
 * Unified Sidebar component with clean admin-style design
 * - Desktop: Full sidebar with labels
 * - Mobile: Icon-only sidebar always visible
 * - Clean section-based navigation
 */
export default function Sidebar({
  isOpen: _isOpen,
  setIsOpen,
  isMobile,
  brand,
  menuItems = [],
  footer,
  width = "w-56",
  bgClass = "bg-card",
}) {
  const sidebarContent = (
    <div className={`flex flex-col h-full ${bgClass} border-r border-border ${width}`}>
      {/* Brand Header */}
      <div className={`h-14 flex items-center ${isMobile ? 'justify-center px-2' : 'px-4'} border-b border-border shrink-0`}>
        {brand || (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <Bell size={16} />
            </div>
            {!isMobile && (
              <div>
                <h2 className="text-[13px] font-semibold text-foreground leading-tight">Smart Campus</h2>
                <p className="text-[10px] text-muted-foreground">Notification System</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-2 ${isMobile ? 'px-1' : 'px-2'} custom-scrollbar`}>
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => isMobile && setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 ${isMobile ? 'p-2.5 justify-center' : 'px-3 py-2 rounded-lg'} transition-all text-[13px] ${
                isActive
                  ? "bg-blue-500/10 text-blue-500 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`
            }
          >
            <item.icon size={isMobile ? 18 : 16} className="shrink-0" />
            {!isMobile && <span className="flex-1">{item.label}</span>}
            {item.badge && !isMobile && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
            {item.badge && isMobile && (
              <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center ${
                item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-border shrink-0">
          {footer}
        </div>
      )}
    </div>
  );

  // Mobile: Icon-only sidebar (always visible on left)
  if (isMobile) {
    return (
      <aside className="fixed left-0 top-0 h-screen z-30 w-16">
        {sidebarContent}
      </aside>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside className="fixed left-0 top-0 h-screen z-30">{sidebarContent}</aside>
  );
}
