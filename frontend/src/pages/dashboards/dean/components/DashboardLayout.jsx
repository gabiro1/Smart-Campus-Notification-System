import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import Sidebar from "@/components/shared/DeanSidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import FloatingCopilot from "../../../../components/FloatingCopilot";
import EmergencyBanner from "../../../../components/common/EmergencyBanner";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DV";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Executive Ambient Glows */}
      <div className="fixed top-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div className="flex-1 flex flex-col lg:ml-72 relative z-10 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-card/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground bg-accent rounded-lg border border-border transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-lg font-semibold hidden sm:block">
              Dean Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 transition-all duration-200 border border-border"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <NotificationCenter />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name || "Dean"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.school?.name || "School Dean"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5">
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Emergency Banner */}
        <EmergencyBanner />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto pb-12"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Copilot AI */}
        <FloatingCopilot />
      </div>
    </div>
  );
}
