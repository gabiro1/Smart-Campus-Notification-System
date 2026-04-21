import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import SystemOverview from "../pages/dashboards/principal/pages/SystemOverview";
import SystemAnalytics from "../pages/dashboards/principal/pages/SystemAnalytics";
import AdminPanel from "../pages/dashboards/principal/pages/AdminPanel";
import AllUsers from "../pages/dashboards/principal/pages/AllUsers";
import GlobalBroadcast from "../pages/dashboards/principal/pages/GlobalBroadcast";
import PrincipalReports from "../pages/dashboards/principal/pages/PrincipalReports";
import PrincipalAudit from "../pages/dashboards/principal/pages/PrincipalAudit";
import PrincipalBackups from "../pages/dashboards/principal/pages/PrincipalBackups";
import PrincipalDepartments from "../pages/dashboards/principal/pages/PrincipalDepartments";
import PrincipalApprovals from "../pages/dashboards/principal/pages/PrincipalApprovals";
import MessagesTab from "../pages/Message/MessagesTab";

export const principalRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dashboard"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <SystemOverview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin"
    path="admin"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <AdminPanel />
      </ProtectedRoute>
    }
  />,
  <Route
    key="departments"
    path="departments"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalDepartments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="reports"
    path="reports"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalReports />
      </ProtectedRoute>
    }
  />,
  <Route
    key="broadcast"
    path="broadcast"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <GlobalBroadcast />
      </ProtectedRoute>
    }
  />,
  <Route
    key="analytics"
    path="analytics"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <SystemAnalytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="audit"
    path="audit"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalAudit />
      </ProtectedRoute>
    }
  />,
  <Route
    key="users"
    path="users"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <AllUsers />
      </ProtectedRoute>
    }
  />,
  <Route
    key="backups"
    path="backups"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalBackups />
      </ProtectedRoute>
    }
  />,
  <Route
    key="approvals"
    path="approvals"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalApprovals />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
];