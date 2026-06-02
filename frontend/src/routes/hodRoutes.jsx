import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import DepartmentOverview from "../pages/dashboards/hod/pages/DepartmentOverview";
import DepartmentBroadcast from "../pages/dashboards/hod/pages/DepartmentBroadcast";
import AllAnnouncements from "../pages/dashboards/hod/pages/AllAnnouncements";
import LecturerManagement from "../pages/dashboards/hod/pages/LecturerManagement";
import DepartmentSettings from "../pages/dashboards/hod/pages/DepartmentSettings";
import MessagesTab from "../features/communication/pages/MessagesTab";
import GovernancePage from "../pages/dashboards/shared/GovernancePage";
import NotificationsPage from "../pages/dashboards/lecturer/pages/Notifications";
import CpApprovals from "../pages/dashboards/hod/pages/CpApprovals";
import CreatorDashboard from "../features/events/pages/CreatorDashboard";
import EventForm from "../features/events/pages/EventForm";
import EventDetailsPage from "../features/events/pages/EventDetailsPage";

export const hodRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dashboard"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <DepartmentOverview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="broadcast"
    path="broadcast"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <DepartmentBroadcast />
      </ProtectedRoute>
    }
  />,
  <Route
    key="announcements"
    path="announcements"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <AllAnnouncements />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lecturers"
    path="lecturers"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <LecturerManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <DepartmentSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="notifications"
    path="notifications"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <NotificationsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="cp-approvals"
    path="cp-approvals"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <CpApprovals />
      </ProtectedRoute>
    }
  />,
  <Route
    key="governance"
    path="governance"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <GovernancePage />
      </ProtectedRoute>
    }
  />,

  // ── EVENT APPLICATIONS ──
  <Route
    key="hod-events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="hod-event-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="hod-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
