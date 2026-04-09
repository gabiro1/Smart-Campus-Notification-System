import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import DepartmentOverview from "../pages/dashboards/hod/pages/DepartmentOverview";
import DepartmentBroadcast from "../pages/dashboards/hod/pages/DepartmentBroadcast";
import AllAnnouncements from "../pages/dashboards/hod/pages/AllAnnouncements";
import LecturerManagement from "../pages/dashboards/hod/pages/LecturerManagement";
import DepartmentReports from "../pages/dashboards/hod/pages/DepartmentReports";
import DepartmentSettings from "../pages/dashboards/hod/pages/DepartmentSettings";
import MessagesTab from "../pages/Message/MessagesTab";
import GovernancePage from "../pages/dashboards/shared/GovernancePage";
import NotificationsPage from "../pages/dashboards/lecturer/pages/Notifications";

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
    key="reports"
    path="reports"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <DepartmentReports />
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
    key="governance"
    path="governance"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <GovernancePage />
      </ProtectedRoute>
    }
  />,
];
