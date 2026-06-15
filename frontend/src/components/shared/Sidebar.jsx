import { NavLink } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "../ui/Logo";

export default function Sidebar({
  isOpen: _isOpen,
  setIsOpen,
  isMobile,
  collapsed,
  onToggleCollapse,
  brand,
  menuItems = [],
  footer,
  width = "w-56",
  bgClass = "bg-card",
}) {
  const navCollapsed = collapsed || isMobile;

  const sidebarContent = (
    <div className={`flex flex-col h-full ${bgClass} border-r border-border ${navCollapsed ? 'w-16' : width}`}>
      <div className={`h-14 flex items-center ${navCollapsed ? 'justify-center px-2' : 'px-4'} border-b border-border shrink-0 gap-2`}>
        {navCollapsed ? (
          <>
            {brand && <div className="flex-1 flex justify-center">{brand}</div>}
            {!isMobile && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              {brand || (
                <div className="flex items-center gap-2.5">
                  <Logo to="/" />
                  <div>
                    <h2 className="text-[13px] font-semibold text-foreground leading-tight">UniNotify AI</h2>
                    <p className="text-[10px] text-muted-foreground">Smart Campus Notification</p>
                  </div>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto py-2 ${navCollapsed ? 'px-1' : 'px-2'} custom-scrollbar`}>
        {menuItems.map((item, idx) => {
          if (item.section) {
            if (navCollapsed) return null;
            return (
              <div key={idx} className="px-3 pt-4 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
              </div>
            );
          }
          return (
            <NavLink
              key={idx}
              to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 ${navCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 rounded-lg'} transition-all text-[13px] ${
                  isActive
                    ? "bg-blue-500/10 text-blue-500 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`
              }
            >
              <item.icon size={navCollapsed ? 18 : 16} className="shrink-0" />
              {!navCollapsed && <span className="flex-1">{item.label}</span>}
              {item.badge && !navCollapsed && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.badge && navCollapsed && (
                <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center ${
                  item.badgeType === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {footer && (
        <div className={`border-t border-border shrink-0 ${navCollapsed ? 'p-2' : 'p-3'}`}>
          {footer}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <aside className="fixed left-0 top-0 h-screen z-30 w-16">
        {sidebarContent}
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen z-30">{sidebarContent}</aside>
  );
}
