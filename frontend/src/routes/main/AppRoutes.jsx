import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "../../components/ui/ToastContext";
import NotFound from "../../pages/error/NotFound";
import { useAuth } from "../../context/AuthContext";

// --- AUTH PAGES ---
import ForgotPassword from "../../features/auth/pages/ForgotPassword";
import ResetPassword from "../../features/auth/pages/ResetPassword";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import ForcePasswordChange from "../../features/auth/pages/ForcePasswordChange";

// --- LAYOUTS ONLY ---
import AdminLayout from "../../layouts/AdminLayout";
import StudentLayout from "../../layouts/StudentLayout";
import GuildLayout from "../../pages/dashboards/guild_president/components/DashboardLayout";
import LecturerLayout from "../../pages/dashboards/lecturer/components/DashboardLayout";
import HodLayout from "../../pages/dashboards/hod/components/DashboardLayout";
import DeanLayout from "../../pages/dashboards/dean/components/DashboardLayout";
import PrincipalLayout from "../../pages/dashboards/principal/components/DashboardLayout";
import HrLayout from "../../pages/dashboards/hr/components/HrLayout";
import RegistrarLayout from "../../pages/dashboards/registrar/components/RegistrarLayout";

// --- MODULAR ROUTE ARRAYS ---
import { publicRoutes } from "../publicRoutes";
import { studentRoutes } from "../studentRoutes";
import { adminRoutes } from "../adminRoutes";
import { hodRoutes } from "../hodRoutes";
import { deanRoutes } from "../deanRoutes";
import { lecturerRoutes } from "../lecturerRoutes";
import { guildRoutes } from "../guildRoutes";
import { principalRoutes } from "../principalRoutes";
import { hrRoutes } from "../hrRoutes";
import { registrarRoutes } from "../registrarRoutes";

// --- DYNAMIC GLOBAL REDIRECTS ---
function ProfileRedirect() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // Dynamically redirect based on the authenticated user's role
  return <Navigate to={`/${user.role}/profile`} replace />;
}

export default function AppRoutes() {
  return (
    <ToastProvider>
      <Routes>
        {/* Unprotected Public Routes */}
        {publicRoutes}

        {/* Global Nav Fallback Fixes */}
        <Route path="/profile" element={<ProfileRedirect />} />

        {/* Auth Pages (public, no layout) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/force-password-change" element={<ForcePasswordChange />} />

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

        <Route path="/principal" element={<PrincipalLayout />}>
          {principalRoutes}
        </Route>

        <Route path="/hr" element={<HrLayout />}>
          {hrRoutes}
        </Route>

        <Route path="/registrar" element={<RegistrarLayout />}>
          {registrarRoutes}
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
