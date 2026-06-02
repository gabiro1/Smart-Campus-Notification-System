import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import DeanOverview from "../pages/dashboards/dean/pages/SchoolOverview";
import DeanApprovals from "../pages/dashboards/dean/pages/HoDApprovals";
import DeanBroadcast from "../pages/dashboards/dean/pages/SchoolBroadcast";

import DeanRoles from "../pages/dashboards/dean/pages/RoleManagement";
import DeanAnnouncements from "../pages/dashboards/dean/pages/AllAnnouncements";
import DeanSettings from "../pages/dashboards/dean/pages/SchoolSettings";
import MessagesTab from "../features/communication/pages/MessagesTab";
import CreatorDashboard from "../features/events/pages/CreatorDashboard";
import EventForm from "../features/events/pages/EventForm";
import EventDetailsPage from "../features/events/pages/EventDetailsPage";

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
    key="roles"
    path="roles"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanRoles />
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
