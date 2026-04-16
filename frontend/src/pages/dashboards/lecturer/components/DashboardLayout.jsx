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
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-card relative">
      {/* Sidebar always visible - icons only on mobile */}
      <LecturerSidebar isOpen={true} setIsOpen={() => {}} isMobile={isMobile} />

      {/* Top Bar - Theme Toggle & Notifications */}
      <div className="sticky top-0 z-[30] w-full bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-8 py-3 flex items-center justify-end gap-4">
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

      {/* Main Content Wrapper */}
      <div className={`flex-1 ${isMobile ? "ml-20" : "ml-72"} min-h-screen relative z-10 flex flex-col`}>
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
    </div>
  );
}
