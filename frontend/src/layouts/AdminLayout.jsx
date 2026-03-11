import { Outlet } from "react-router-dom";
import AdminSidebar from "../pages/dashboards/admin/components/AdminSidebar";
import AdminTopbar from "../pages/dashboards/admin/components/AdminTopbar"; // Import the Topbar
import { motion } from "framer-motion";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden">
      {/* 1. Fixed Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content Area (Scrollable independently of Sidebar) */}
      <main className="flex-1 ml-72 h-screen flex flex-col relative overflow-hidden">
        {/* Subtle Background Glow for Admin area */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* 3. Sticky Topbar applied globally! */}
        <AdminTopbar />

        {/* 4. Page Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-full"
          >
            {/* This renders the Dashboard, CreateEvent, etc. */}
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
