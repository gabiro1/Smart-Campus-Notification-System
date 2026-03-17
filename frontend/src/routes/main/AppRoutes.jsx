import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "../../components/ui/ToastContext";
import NotFound from "../../pages/error/NotFound";

// --- LAYOUTS ONLY ---
import AdminLayout from "../../layouts/AdminLayout";
import StudentLayout from "../../layouts/StudentLayout";
import GuildLayout from "../../pages/dashboards/guild_president/Components/DashboardLayout";
import LecturerLayout from "../../pages/dashboards/lecturer/components/DashboardLayout";
import HodLayout from "../../pages/dashboards/hod/components/DashboardLayout";
import DeanLayout from "../../pages/dashboards/dean/components/DashboardLayout";

// --- MODULAR ROUTE ARRAYS ---
import { publicRoutes } from "../publicRoutes";
import { studentRoutes } from "../studentRoutes";
import { adminRoutes } from "../adminRoutes";
import { hodRoutes } from "../hodRoutes";
import { deanRoutes } from "../deanRoutes";
import { lecturerRoutes } from "../lecturerRoutes";
import { guildRoutes } from "../guildRoutes";

export default function AppRoutes() {
  return (
    <ToastProvider>
      <Routes>
        {/* Unprotected Public Routes */}
        {publicRoutes}

        {/* Protected Role-Based Layouts */}
        <Route path="/student" element={<StudentLayout />}>
          {studentRoutes}
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          {adminRoutes}
        </Route>

        <Route path="/hod" element={<HodLayout />}>
          {hodRoutes}
        </Route>

        <Route path="/dean" element={<DeanLayout />}>
          {deanRoutes}
        </Route>

        <Route path="/lecturer" element={<LecturerLayout />}>
          {lecturerRoutes}
        </Route>

        <Route path="/guild" element={<GuildLayout />}>
          {guildRoutes}
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
