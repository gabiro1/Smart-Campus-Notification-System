import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import DeanOverview from "../pages/dashboards/dean/pages/SchoolOverview";
import DeanApprovals from "../pages/dashboards/dean/pages/HoDApprovals";
import DeanBroadcast from "../pages/dashboards/dean/pages/SchoolBroadcast";
import DeanAnalytics from "../pages/dashboards/dean/pages/Analytics";
import DeanRoles from "../pages/dashboards/dean/pages/RoleManagement";
import DeanAnnouncements from "../pages/dashboards/dean/pages/AllAnnouncements";
import DeanReports from "../pages/dashboards/dean/pages/Reports";
import DeanSettings from "../pages/dashboards/dean/pages/SchoolSettings";
import MessagesTab from "../pages/Message/MessagesTab";

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
    key="analytics"
    path="analytics"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanAnalytics />
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
    key="reports"
    path="reports"
    element={
      <ProtectedRoute allowedRoles={["dean"]}>
        <DeanReports />
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
];
