import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import SystemOverview from "../features/admin/pages/SystemOverview";
import EventsDashboard from "../features/admin/pages/EventsDashboard";
import EditEventPage from "../features/admin/pages/EditEventPage";
import UserManagement from "../features/admin/pages/UserManagement";
import ComposeBroadcastModal from "../features/admin/pages/CreateEventPage";
import CoreSettings from "../features/admin/pages/CoreSettings";
import Maintenance from "../features/admin/pages/Maintenance";
import Backups from "../features/admin/pages/Backups";
import AdminNotifications from "../features/admin/pages/AdminNotifications";
import SupportTickets from "../features/admin/pages/SupportTickets";
import GovernancePage from "../pages/dashboards/shared/GovernancePage";
import AcademicStructure from "../features/admin/pages/AcademicStructure";
import SMSTestPage from "../features/admin/pages/SMSTestPage";
import TimetableManagement from "../features/admin/pages/TimetableManagement";
import HRAccounts from "../features/admin/pages/HRAccounts";
import AuditLogs from "../features/admin/pages/AuditLogs";
import EmergencyOverride from "../features/admin/pages/EmergencyOverride";
import RoleManagement from "../features/admin/pages/RoleManagement";
import CreatorDashboard from "../features/events/pages/CreatorDashboard";
import EventForm from "../features/events/pages/EventForm";
import EventDetailsPage from "../features/events/pages/EventDetailsPage";
import RoleAssignmentsApproval from "../features/admin/pages/RoleAssignmentsApproval";
import SubmitCouncilElection from "../features/admin/pages/SubmitCouncilElection";

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
