import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import DepartmentOverview from "../pages/dashboards/hod/pages/DepartmentOverview";
import Approvals from "../pages/dashboards/hod/pages/Approvals";
import DepartmentBroadcast from "../pages/dashboards/hod/pages/DepartmentBroadcast";
import AllAnnouncements from "../pages/dashboards/hod/pages/AllAnnouncements";
import ManageStaff from "../pages/dashboards/hod/pages/ManageStaff";
import LecturerManagement from "../pages/dashboards/hod/pages/LecturerManagement";
import DepartmentReports from "../pages/dashboards/hod/pages/DepartmentReports";
import DepartmentSettings from "../pages/dashboards/hod/pages/DepartmentSettings";
import MessagesTab from "../pages/Message/MessagesTab";

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
    key="approvals"
    path="approvals"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <Approvals />
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
    key="staff"
    path="staff"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <ManageStaff />
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
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
];
