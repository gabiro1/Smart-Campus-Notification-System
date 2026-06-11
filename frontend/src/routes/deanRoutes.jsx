import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const DeanOverview = lazy(() => import("../pages/dashboards/dean/pages/SchoolOverview"));
const DeanApprovals = lazy(() => import("../pages/dashboards/dean/pages/HoDApprovals"));
const DeanBroadcast = lazy(() => import("../pages/dashboards/dean/pages/SchoolBroadcast"));
const DeanAnnouncements = lazy(() => import("../pages/dashboards/dean/pages/AllAnnouncements"));
const DeanSettings = lazy(() => import("../pages/dashboards/dean/pages/SchoolSettings"));
const MessagesTab = lazy(() => import("../features/communication/pages/MessagesTab"));
const CreatorDashboard = lazy(() => import("../features/events/pages/CreatorDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));

export const deanRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dashboard"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanOverview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="approvals"
    path="approvals"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanApprovals />
      </ProtectedRoute>
    }
  />,
  <Route
    key="broadcast"
    path="broadcast"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanBroadcast />
      </ProtectedRoute>
    }
  />,
  <Route
    key="announcements"
    path="announcements"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanAnnouncements />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,

  // ── EVENT APPLICATIONS ──
  <Route
    key="dean-events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="dean-event-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="dean-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
