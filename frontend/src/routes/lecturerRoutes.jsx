import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import LecturerOverview from "../pages/dashboards/lecturer/pages/Dashboard";
import LecturerCreateAnnouncement from "../pages/dashboards/lecturer/pages/CreateAnnouncement";
import LecturerAnnouncements from "../pages/dashboards/lecturer/pages/MyAnnouncements";
import LecturerNotifications from "../pages/dashboards/lecturer/pages/Notifications";
import LecturerClasses from "../pages/dashboards/lecturer/pages/MyClasses";
import LecturerAnalytics from "../pages/dashboards/lecturer/pages/Analytics";
import LecturerSettings from "../pages/dashboards/lecturer/Settings";
import LecturerAnnouncementQA from "../pages/dashboards/lecturer/pages/AnnouncementQA";
import MessagesTab from "../pages/Message/MessagesTab";
import GovernancePage from "../pages/dashboards/shared/GovernancePage";
import SupportPage from "../pages/dashboards/shared/SupportPage";

export const lecturerRoutes = [
  <Route key="index" index element={<Navigate to="console" replace />} />,
  <Route
    key="console"
    path="console"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerOverview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="create"
    path="create"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerCreateAnnouncement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="edit"
    path="edit/:id"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerCreateAnnouncement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="announcements"
    path="announcements"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerAnnouncements />
      </ProtectedRoute>
    }
  />,
  <Route
    key="qa"
    path="qa"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerAnnouncementQA />
      </ProtectedRoute>
    }
  />,
  <Route
    key="notifications"
    path="notifications"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerNotifications />
      </ProtectedRoute>
    }
  />,
  <Route
    key="classes"
    path="classes"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerClasses />
      </ProtectedRoute>
    }
  />,
  <Route
    key="analytics"
    path="analytics"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerAnalytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="governance"
    path="governance"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <GovernancePage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="support"
    path="support"
    element={
      <ProtectedRoute allowedRoles={["lecturer", "hod", "dean", "principal", "admin"]}>
        <SupportPage />
      </ProtectedRoute>
    }
  />,
];
