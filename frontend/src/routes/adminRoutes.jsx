import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const SystemOverview = lazy(() => import("../features/admin/pages/SystemOverview"));
const EventsDashboard = lazy(() => import("../features/admin/pages/EventsDashboard"));
const EditEventPage = lazy(() => import("../features/admin/pages/EditEventPage"));
const UserManagement = lazy(() => import("../features/admin/pages/UserManagement"));
const ComposeBroadcastModal = lazy(() => import("../features/admin/pages/CreateEventPage"));
const CoreSettings = lazy(() => import("../features/admin/pages/CoreSettings"));
const Maintenance = lazy(() => import("../features/admin/pages/Maintenance"));
const Backups = lazy(() => import("../features/admin/pages/Backups"));
const AdminNotifications = lazy(() => import("../features/admin/pages/AdminNotifications"));
const SupportTickets = lazy(() => import("../features/admin/pages/SupportTickets"));
const GovernancePage = lazy(() => import("../pages/dashboards/shared/GovernancePage"));
const AcademicStructure = lazy(() => import("../features/admin/pages/AcademicStructure"));
const SMSTestPage = lazy(() => import("../features/admin/pages/SMSTestPage"));
const TimetableManagement = lazy(() => import("../features/admin/pages/TimetableManagement"));
const HRAccounts = lazy(() => import("../features/admin/pages/HRAccounts"));
const AuditLogs = lazy(() => import("../features/admin/pages/AuditLogs"));
const EmergencyOverride = lazy(() => import("../features/admin/pages/EmergencyOverride"));
const RoleManagement = lazy(() => import("../features/admin/pages/RoleManagement"));
const CreatorDashboard = lazy(() => import("../features/events/pages/CreatorDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));
const RoleAssignmentsApproval = lazy(() => import("../features/admin/pages/RoleAssignmentsApproval"));
const SubmitCouncilElection = lazy(() => import("../features/admin/pages/SubmitCouncilElection"));

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
    key="notifications"
    path="notifications"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminNotifications />
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
    key="admin-events-apply"
    path="events/apply"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-events-apply-create"
    path="events/apply/create"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm isDirectPublish={true} />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-events-apply-details"
    path="events/apply/:eventId"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <EventDetailsPage />
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
    key="roles"
    path="roles"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <RoleManagement />
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
  <Route
    key="timetable"
    path="timetable"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <TimetableManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="hr-accounts"
    path="hr-accounts"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <HRAccounts />
      </ProtectedRoute>
    }
  />,
  <Route
    key="role-assignments"
    path="role-assignments"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <RoleAssignmentsApproval />
      </ProtectedRoute>
    }
  />,
  <Route
    key="audit-logs"
    path="audit-logs"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AuditLogs />
      </ProtectedRoute>
    }
  />,
  <Route
    key="council-election"
    path="council-election"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <SubmitCouncilElection />
      </ProtectedRoute>
    }
  />,
  <Route
    key="emergency"
    path="emergency"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <EmergencyOverride />
      </ProtectedRoute>
    }
  />,
];
