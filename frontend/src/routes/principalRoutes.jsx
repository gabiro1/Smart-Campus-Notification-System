import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import SystemOverview from "../pages/dashboards/principal/pages/SystemOverview";
import SystemAnalytics from "../pages/dashboards/principal/pages/SystemAnalytics";
import AdminPanel from "../pages/dashboards/principal/pages/AdminPanel";
import AllUsers from "../pages/dashboards/principal/pages/AllUsers";
import GlobalBroadcast from "../pages/dashboards/principal/pages/GlobalBroadcast";
import SystemSettings from "../pages/dashboards/principal/pages/SystemSettings";
import Maintenance from "../pages/dashboards/principal/pages/Maintenance";
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
    key="analytics"
    path="analytics"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <SystemAnalytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-panel"
    path="admin-panel"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <AdminPanel />
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
    key="broadcast"
    path="broadcast"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <GlobalBroadcast />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <SystemSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="maintenance"
    path="maintenance"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <Maintenance />
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
