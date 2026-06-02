import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import HODSidebar from "@/components/shared/HODSidebar";

export default function HodLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-accent border-border text-foreground hover:bg-accent transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      <div className={`flex-1 min-h-screen relative z-10 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-20 md:ml-64'}`}>
        <main className="flex-1 flex flex-col w-full h-full relative pt-2">
          <Outlet />
        </main>
      </div>

      <HODSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isMobile={isMobile}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
    </div>
  );
}
