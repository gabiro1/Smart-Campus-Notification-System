import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const DepartmentOverview = lazy(() => import("../pages/dashboards/hod/pages/DepartmentOverview"));
const DepartmentBroadcast = lazy(() => import("../pages/dashboards/hod/pages/DepartmentBroadcast"));
const AllAnnouncements = lazy(() => import("../pages/dashboards/hod/pages/AllAnnouncements"));
const LecturerManagement = lazy(() => import("../pages/dashboards/hod/pages/LecturerManagement"));
const DepartmentSettings = lazy(() => import("../pages/dashboards/hod/pages/DepartmentSettings"));
const MessagesTab = lazy(() => import("../features/communication/pages/MessagesTab"));
const GovernancePage = lazy(() => import("../pages/dashboards/shared/GovernancePage"));
const NotificationsPage = lazy(() => import("../pages/dashboards/lecturer/pages/Notifications"));
const CpApprovals = lazy(() => import("../pages/dashboards/hod/pages/CpApprovals"));
const CreatorDashboard = lazy(() => import("../features/events/pages/CreatorDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));
const HodTimetable = lazy(() => import("../pages/dashboards/hod/pages/HodTimetable"));

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
    key="timetable"
    path="timetable"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <HodTimetable />
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
    key="cp-approvals"
    path="cp-approvals"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <CpApprovals />
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

  // ── EVENT APPLICATIONS ──
  <Route
    key="hod-events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="hod-event-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="hod-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["hod"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
