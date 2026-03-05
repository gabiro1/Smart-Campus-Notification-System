import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import Sidebar from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* Executive Ambient Glows */}
      <div className="fixed top-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div className="flex-1 flex flex-col lg:ml-64 relative z-10 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-black/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-lg font-semibold hidden sm:block">
              Executive Control Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#050505]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">
                  Dr. Robert Vance
                </p>
                <p className="text-xs text-neutral-500">Dean of Sciences</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5">
                <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center text-xs font-bold text-white">
                  RV
                </div>
              </div>
            </div>
          </div>
        </header>

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
      </div>
    </div>
  );
}
