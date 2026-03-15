import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  return (
    <div className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10 flex flex-col h-screen">
      {/* This is where the specific pages (Feed, Profile, etc.) will render */}
      <Outlet />
      {/* Persistent Navigation */}
      <Sidebar />
    </div>
  );
}
