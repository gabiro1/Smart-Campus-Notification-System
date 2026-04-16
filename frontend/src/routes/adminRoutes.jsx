import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import SystemOverview from "../pages/dashboards/Admin/pages/SystemOverview";
import EventsDashboard from "../pages/dashboards/Admin/pages/EventsDashboard";
import EditEventPage from "../pages/dashboards/Admin/pages/EditEventPage";
import UserManagement from "../pages/dashboards/Admin/pages/UserManagement";
import ComposeBroadcastModal from "../pages/dashboards/Admin/pages/CreateEventPage";
import FullAnalytics from "../pages/dashboards/Admin/pages/FullAnalytics";
import CoreSettings from "../pages/dashboards/Admin/pages/CoreSettings";
import Maintenance from "../pages/dashboards/Admin/pages/Maintenance";
import Backups from "../pages/dashboards/Admin/pages/Backups";
import MessagesTab from "../pages/Message/MessagesTab";
import SupportTickets from "../pages/dashboards/Admin/pages/SupportTickets";
import GovernancePage from "../pages/dashboards/shared/GovernancePage";
import AcademicStructure from "../pages/dashboards/Admin/pages/AcademicStructure";
import SMSTestPage from "../pages/dashboards/Admin/pages/SMSTestPage";

export const adminRoutes = [
  <Route key="index" index element={<Navigate to="overview" replace />} />,
  <Route
    key="overview"
    path="overview"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <SystemOverview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <EventsDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events-edit"
    path="events/edit/:id"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <EditEventPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <ComposeBroadcastModal />
      </ProtectedRoute>
    }
  />,
  <Route
    key="users"
    path="users"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <UserManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="analytics"
    path="analytics"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <FullAnalytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <CoreSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="maintenance"
    path="maintenance"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Maintenance />
      </ProtectedRoute>
    }
  />,
  <Route
    key="backups"
    path="backups"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Backups />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="support"
    path="support"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <SupportTickets />
      </ProtectedRoute>
    }
  />,
  <Route
    key="governance"
    path="governance"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <GovernancePage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="academic"
    path="academic"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AcademicStructure />
      </ProtectedRoute>
    }
  />,
  <Route
    key="sms-test"
    path="sms-test"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <SMSTestPage />
      </ProtectedRoute>
    }
  />,
];
