import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, Sun, Moon, Bell } from "lucide-react";
import Sidebar from "@/components/shared/GuildSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import FloatingCopilot from "../../../../components/FloatingCopilot";
import EmergencyBanner from "../../../../components/common/EmergencyBanner";

export default function GuildLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GP";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <main className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10">
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
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
              Guild President Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
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

            <div className="relative">
              <NotificationCenter />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name || 'Guild President'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.department?.name || 'Guild Council'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5">
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <EmergencyBanner />

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-8 h-full overflow-y-auto custom-scrollbar"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        <FloatingCopilot />
      </main>
    </div>
  );
}
