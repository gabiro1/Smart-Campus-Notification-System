import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// --- STUDENT IMPORTS ---
import EnhancedStudentDashboard from "../pages/dashboards/student/pages/Dashboard/EnhancedStudentDashboard";
import AnnouncementsPage from "../pages/dashboards/student/pages/announcement/AnnouncementsPage";
import NotificationsPage from "../pages/dashboards/student/pages/Notifications/NotificationsPage";
import EventsPage from "../pages/dashboards/student/Events/EventsPage";
import BookmarksPage from "../pages/dashboards/student/Events/BookmarksPage";
import EventDetails from "../pages/dashboards/student/Events/EventDetails";
import RemindersTab from "../pages/dashboards/student/pages/Reminder/RemindersTab";
import TimeTable from "../pages/dashboards/student/component/TimeTable";
import MessagesTab from "../pages/Message/MessagesTab";
import Settings from "../pages/dashboards/student/pages/Settings/Settings";

export const studentRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dash"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <EnhancedStudentDashboard />
      </ProtectedRoute>
    }
  />,
  // ✅ FIX: Now 'announcements' loads the actual AnnouncementsPage
  <Route
    key="announcements"
    path="announcements"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <AnnouncementsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <EventsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="bookmarks"
    path="bookmarks"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <BookmarksPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <EventDetails />
      </ProtectedRoute>
    }
  />,
  <Route
    key="reminders"
    path="reminders"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <RemindersTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="timetable"
    path="timetable"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <TimeTable />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="notifications"
    path="notifications"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <NotificationsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  // Redirect old /student/profile to /student/settings
  <Route
    key="profile-redirect"
    path="profile"
    element={<Navigate to="settings" replace />}
  />,
];
