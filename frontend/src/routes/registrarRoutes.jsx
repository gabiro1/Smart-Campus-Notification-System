import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const RegistrarDashboard = lazy(() => import("../pages/dashboards/registrar/pages/RegistrarDashboard"));
const NewStudent = lazy(() => import("../pages/dashboards/registrar/pages/NewStudent"));
const StudentRecords = lazy(() => import("../pages/dashboards/registrar/pages/StudentRecords"));
const EnrollmentStats = lazy(() => import("../pages/dashboards/registrar/pages/EnrollmentStats"));
const RegistrarEvents = lazy(() => import("../pages/dashboards/registrar/pages/RegistrarEvents"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));

export const registrarRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dashboard"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["registrar", "admin"]}>
        <RegistrarDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="new-student"
    path="new-student"
    element={
      <ProtectedRoute allowedRoles={["registrar", "admin"]}>
        <NewStudent />
      </ProtectedRoute>
    }
  />,
  <Route
    key="students"
    path="students"
    element={
      <ProtectedRoute allowedRoles={["registrar", "admin"]}>
        <StudentRecords />
      </ProtectedRoute>
    }
  />,
  <Route
    key="stats"
    path="stats"
    element={
      <ProtectedRoute allowedRoles={["registrar", "admin"]}>
        <EnrollmentStats />
      </ProtectedRoute>
    }
  />,

  // ── EVENT APPLICATIONS ──
  <Route
    key="registrar-events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["registrar", "admin"]}>
        <RegistrarEvents />
      </ProtectedRoute>
    }
  />,
  <Route
    key="registrar-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["registrar", "admin"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
