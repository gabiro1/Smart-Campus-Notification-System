import { useState } from "react";
import { Bell } from "lucide-react";
import { useRealTimeNotifications } from "../../../../hooks/useRealTimeNotifications";
import NotificationDropdown from "./NotificationDropdown";

export default function StudentHeader() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // 📡 Real-time Notification Engine extracted from Sidebar
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    clearAll 
  } = useRealTimeNotifications();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-card/80 backdrop-blur-md border-b border-white/5 flex items-center justify-end px-4 md:px-8">
      {/* Right side actions */}
      <div className="flex items-center gap-4">
        
        {/* 🔔 Real-time Pulse Container */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2.5 rounded-xl transition-all duration-200 relative group flex items-center justify-center ${
              isNotifOpen
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                : "text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-200 border border-transparent"
            }`}
          >
            <Bell size={20} strokeWidth={isNotifOpen ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
            
            {/* Unread Badge / Pulse */}
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-border z-10" />
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
              </>
            )}
          </button>

          {/* Dropdown - Positioned relative to the bell icon */}
          {/* Note: Ensure NotificationDropdown accepts these props and handles its own internal layout nicely */}
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 origin-top-right">
            <NotificationDropdown 
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
            />
          </div>
        </div>

        {/* You can add a User Profile Avatar trigger here later */}
      </div>
    </header>
  );
}