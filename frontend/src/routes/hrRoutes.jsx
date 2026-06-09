import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const HrDashboard = lazy(() => import("../features/hr/pages/HrDashboard"));
const HrWorkflowDashboard = lazy(() => import("../features/hr/pages/StaffDrafts"));
const CreatorDashboard = lazy(() => import("../features/events/pages/CreatorDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));

export const hrRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dashboard"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["hr", "admin"]}>
        <HrDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="drafts"
    path="drafts"
    element={
      <ProtectedRoute allowedRoles={["hr", "admin"]}>
        <HrWorkflowDashboard defaultTab="drafts" />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assignments"
    path="assignments"
    element={
      <ProtectedRoute allowedRoles={["hr", "admin"]}>
        <HrWorkflowDashboard defaultTab="assignments" />
      </ProtectedRoute>
    }
  />,

  // ── EVENT APPLICATIONS ──
  <Route
    key="hr-events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["hr", "admin"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="hr-event-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["hr", "admin"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="hr-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["hr", "admin"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
