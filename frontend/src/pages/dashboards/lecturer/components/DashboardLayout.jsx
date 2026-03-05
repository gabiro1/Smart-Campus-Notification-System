import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex overflow-hidden relative">
      {/* Ambient Liquid Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar />

      <main className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10 flex flex-col h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 p-8 overflow-y-auto custom-scrollbar"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
