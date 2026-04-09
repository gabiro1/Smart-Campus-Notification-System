import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import HODSidebar from "@/components/shared/HODSidebar";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout() {
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
    <div className="min-h-screen bg-[#050505] relative">
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

      {/* Main Content Wrapper - Shifted by Sidebar width */}
      <div className="flex-1 ml-20 md:ml-64 min-h-screen relative z-10 flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col w-full h-full relative pt-2">
          {/* Page Content */}
          <Outlet />
        </main>
      </div>

      {/* Persistent Navigation - Pass mobile state */}
      <HODSidebar isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
    </div>
  );
}
