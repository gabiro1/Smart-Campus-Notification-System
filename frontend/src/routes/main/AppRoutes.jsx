import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "../../components/ui/ToastContext";
import NotFound from "../../pages/error/NotFound";
import { useAuth } from "../../context/AuthContext";
import NeuralFlowLoader from "../../components/ui/NeuralFlowLoader";

// --- AUTH PAGES (static - small) ---
import ForgotPassword from "../../features/auth/pages/ForgotPassword";
import ResetPassword from "../../features/auth/pages/ResetPassword";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import ForcePasswordChange from "../../features/auth/pages/ForcePasswordChange";

// --- UNIFIED LAYOUT (static - always needed) ---
import DashboardLayout from "../../components/layout/DashboardLayout";

// --- MODULAR ROUTE ARRAYS (pages inside are lazy) ---
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
      <Suspense fallback={<NeuralFlowLoader />}>
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

          {/* Protected Role-Based Layouts - Unified DashboardLayout */}
          <Route path="/student" element={<DashboardLayout role="student" />}>
            {studentRoutes}
          </Route>

          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            {adminRoutes}
          </Route>

          <Route path="/hod" element={<DashboardLayout role="hod" />}>
            {hodRoutes}
          </Route>

          <Route path="/dean" element={<DashboardLayout role="dean" />}>
            {deanRoutes}
          </Route>

          <Route path="/lecturer" element={<DashboardLayout role="lecturer" />}>
            {lecturerRoutes}
          </Route>

          <Route path="/guild" element={<DashboardLayout role="guild_president" />}>
            {guildRoutes}
          </Route>

          <Route path="/principal" element={<DashboardLayout role="principal" />}>
            {principalRoutes}
          </Route>

          <Route path="/hr" element={<DashboardLayout role="hr" />}>
            {hrRoutes}
          </Route>

          <Route path="/registrar" element={<DashboardLayout role="registrar" />}>
            {registrarRoutes}
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
