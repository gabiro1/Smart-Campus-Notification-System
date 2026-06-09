import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const SystemOverview = lazy(() => import("../pages/dashboards/principal/pages/SystemOverview"));
const GlobalBroadcast = lazy(() => import("../pages/dashboards/principal/pages/GlobalBroadcast"));
const PrincipalDepartments = lazy(() => import("../pages/dashboards/principal/pages/PrincipalDepartments"));
const PrincipalApprovals = lazy(() => import("../pages/dashboards/principal/pages/PrincipalApprovals"));
const ReportsAnalytics = lazy(() => import("../pages/dashboards/principal/pages/ReportsAnalytics"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));
const CreatorDashboard = lazy(() => import("../features/events/pages/CreatorDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const RoleAssignments = lazy(() => import("../features/admin/pages/RoleAssignmentsApproval"));
const ElectionApproval = lazy(() => import("../pages/dashboards/principal/pages/ElectionApproval"));

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
    key="role-assignments"
    path="role-assignments"
    element={
      <ProtectedRoute allowedRoles={["principal", "admin"]}>
        <RoleAssignments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="student-leadership"
    path="student-leadership"
    element={
      <ProtectedRoute allowedRoles={["principal", "admin"]}>
        <ElectionApproval />
      </ProtectedRoute>
    }
  />,

  <Route
    key="principal-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,

  // ── PRINCIPAL OWN EVENT CREATION ──
  <Route
    key="principal-events-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm
            isDirectPublish={true}
            onSubmit={async (data) => {
              const { default: eventService } = await import('../services/eventService');
              await eventService.createAndPublish(data);
              window.location.href = '/principal/my-events';
            }}
            onCancel={() => window.location.href = '/principal/my-events'}
          />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="principal-my-events"
    path="my-events"
    element={
      <ProtectedRoute allowedRoles={["principal"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
];
