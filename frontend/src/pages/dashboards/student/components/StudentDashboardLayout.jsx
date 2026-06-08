import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import StudentSidebar from "../../../../components/shared/StudentSidebar";
import StudentTopBar from "./StudentTopBar";
import OnboardingWizard from "../../../../components/onboarding/OnboardingWizard";
import { useAuth } from "../../../../context/AuthContext";

export default function StudentDashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      <StudentSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col relative z-10 h-screen overflow-hidden transition-all duration-300 ${
        isMobile ? '' : (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72')
      }`}>
        <StudentTopBar isMobile={isMobile} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1400px] mx-auto pb-12"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {user?.role === "student" && !user?.hasCompletedOnboarding && (
        <OnboardingWizard />
      )}
    </div>
  );
}
