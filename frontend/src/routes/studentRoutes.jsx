import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// --- STUDENT IMPORTS ONLY ---
import EnhancedStudentDashboard from "../pages/dashboards/student/pages/Dashboard/EnhancedStudentDashboard";
import { NotificationsTab } from "../pages/dashboards/student/pages/Notifications/NotificationsTab";
import EventFeedGrid from "../pages/dashboards/student/Events/EventFeedGrid";
import RemindersTab from "../pages/dashboards/student/pages/Reminder/RemindersTab";
import TimeTable from "../pages/dashboards/student/component/TimeTable";
import MessagesTab from "../pages/Message/MessagesTab";
import Profile from "../pages/dashboards/student/pages/Profile/Profile";
import Settings from "../pages/dashboards/student/pages/Profile/Settings";

export const studentRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dash"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <EnhancedStudentDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="announcements"
    path="announcements"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <NotificationsTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <EventFeedGrid />
      </ProtectedRoute>
    }
  />,
  <Route
    key="reminders"
    path="reminders"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <RemindersTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="timetable"
    path="timetable"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <TimeTable />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="profile"
    path="profile"
    element={
      <ProtectedRoute allowedRoles={["student", "admin"]}>
        <Profile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
];
