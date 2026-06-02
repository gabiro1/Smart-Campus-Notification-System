import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HrSidebar from "@/components/shared/HrSidebar";
import HrTopbar from "./HrTopbar";
import FloatingCopilot from "../../../../components/FloatingCopilot";

export default function HrLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const contentMargin = isMobile ? "ml-16" : sidebarCollapsed ? "ml-20" : "ml-56";

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed top-[-20%] left-[10%] w-[60%] h-[60%] bg-violet-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      <HrSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isMobile={isMobile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`${contentMargin} min-h-screen relative z-10 flex flex-col transition-all duration-300`}>
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md">
          <HrTopbar
            title="HR Dashboard"
            onMenuClick={() => setIsOpen(true)}
            onCollapseClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            collapsed={sidebarCollapsed}
          />
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-full"
          >
            <Outlet />
          </motion.div>
        </div>

        <FloatingCopilot />
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
