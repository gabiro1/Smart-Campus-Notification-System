import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../pages/dashboards/admin/components/AdminSidebar";
import AdminTopbar from "../pages/dashboards/admin/components/AdminTopbar";
import FloatingCopilot from "../components/FloatingCopilot";

export default function AdminLayout() {
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
      {/* Sidebar - Always visible on mobile, toggleable on desktop */}
      <AdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        isMobile={isMobile}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Wrapper */}
      <div className={`${contentMargin} min-h-screen relative z-10 flex flex-col transition-all duration-300`}>
        {/* Sticky Topbar */}
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md">
          <AdminTopbar 
            onMenuClick={() => setIsOpen(true)} 
            onCollapseClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Page Content */}
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

        {/* Floating Copilot AI */}
        <FloatingCopilot />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
