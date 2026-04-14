import { Outlet } from "react-router-dom";
import LecturerSidebar from "@/components/shared/LecturerSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import EmergencyBanner from "@/components/common/EmergencyBanner";
import FloatingCopilot from "@/components/FloatingCopilot";
import { Sun, Moon } from "lucide-react";
import NotificationCenter from "@/components/common/NotificationCenter";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-card relative">
      {/* Mobile Menu Toggle - Only visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background/90 border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Top Bar - Theme Toggle & Notifications */}
      <div className="sticky top-0 z-[40] w-full bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-8 py-3 flex items-center justify-end gap-4">
        <div className="flex items-center gap-3">
          {/* Date */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 border border-border"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>

          {/* Notification Bell */}
          <NotificationCenter />
        </div>
      </div>

      {/* Main Content Wrapper - Shifted by Sidebar width */}
      <div className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10 flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col w-full h-full relative pt-2">
          {/* Emergency Alert Banner */}
          <EmergencyBanner />

          {/* Page Content */}
          <Outlet />
        </main>

        {/* Floating Copilot AI */}
        <FloatingCopilot />
      </div>

      {/* Persistent Navigation - Pass mobile state */}
      <LecturerSidebar isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
    </div>
  );
}
