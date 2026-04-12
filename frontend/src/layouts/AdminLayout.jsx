import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "../pages/dashboards/admin/components/AdminSidebar";
import AdminTopbar from "../pages/dashboards/admin/components/AdminTopbar";
import { motion } from "framer-motion";
import FloatingCopilot from "../components/FloatingCopilot";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    <div className="min-h-screen bg-background relative">
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/90 border border-border text-foreground hover:bg-accent transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10 flex flex-col">
        {/* Sticky Topbar */}
        <AdminTopbar />

        {/* Page Content */}
        <div className="flex-1 overflow-visible custom-scrollbar p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-full max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>

        {/* Floating Copilot AI */}
        <FloatingCopilot />
      </div>

      {/* Sidebar */}
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
    </div>
  );
}
