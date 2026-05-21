import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import SystemOverview from "../pages/dashboards/principal/pages/SystemOverview";
import GlobalBroadcast from "../pages/dashboards/principal/pages/GlobalBroadcast";
import PrincipalDepartments from "../pages/dashboards/principal/pages/PrincipalDepartments";
import PrincipalApprovals from "../pages/dashboards/principal/pages/PrincipalApprovals";
import ReportsAnalytics from "../pages/dashboards/principal/pages/ReportsAnalytics";
import ReportInbox from "../pages/dashboards/dean/pages/ReportInbox";

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
    key="departments"
    path="departments"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalDepartments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="report-inbox"
    path="report-inbox"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <ReportInbox hideCreate />
      </ProtectedRoute>
    }
  />,
  <Route
    key="reports-analytics"
    path="reports-analytics"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <ReportsAnalytics />
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
    key="approvals"
    path="approvals"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <PrincipalApprovals />
      </ProtectedRoute>
    }
  />,
];
