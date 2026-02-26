import { Outlet } from "react-router-dom";
import AdminSidebar from "../pages/admin/components/AdminSidebar";
import { motion } from "framer-motion";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">
      {/* 1. Fixed Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Subtle Background Glow for Admin area */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8"
        >
          {/* This renders the Dashboard, CreateEvent, etc. */}
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
