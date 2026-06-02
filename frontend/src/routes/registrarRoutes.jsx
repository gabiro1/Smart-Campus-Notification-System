import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import RegistrarDashboard from "../pages/dashboards/registrar/pages/RegistrarDashboard";
import NewStudent from "../pages/dashboards/registrar/pages/NewStudent";
import StudentRecords from "../pages/dashboards/registrar/pages/StudentRecords";
import EnrollmentStats from "../pages/dashboards/registrar/pages/EnrollmentStats";
import RegistrarEvents from "../pages/dashboards/registrar/pages/RegistrarEvents";
import EventDetailsPage from "../features/events/pages/EventDetailsPage";

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
