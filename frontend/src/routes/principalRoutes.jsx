import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import SystemOverview from "../pages/dashboards/principal/pages/SystemOverview";
import GlobalBroadcast from "../pages/dashboards/principal/pages/GlobalBroadcast";
import PrincipalDepartments from "../pages/dashboards/principal/pages/PrincipalDepartments";
import PrincipalApprovals from "../pages/dashboards/principal/pages/PrincipalApprovals";
import ReportsAnalytics from "../pages/dashboards/principal/pages/ReportsAnalytics";
import EventDetailsPage from "../features/events/pages/EventDetailsPage";
import CreatorDashboard from "../features/events/pages/CreatorDashboard";
import EventForm from "../features/events/pages/EventForm";

import RoleAssignments from "../features/admin/pages/RoleAssignmentsApproval";
import ElectionApproval from "../pages/dashboards/principal/pages/ElectionApproval";

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
