import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// --- STUDENT IMPORTS ---
import EnhancedStudentDashboard from "../pages/dashboards/student/pages/Dashboard/EnhancedStudentDashboard";
// ✅ IMPORT THE NEW PAGE HERE (Adjust the folder path to match where you saved it)
import AnnouncementsPage from "../pages/dashboards/student/pages/announcement/AnnouncementsPage";
import { NotificationsTab } from "../pages/dashboards/student/pages/Notifications/NotificationsTab";
import EventsPage from "../pages/dashboards/student/Events/EventsPage";
import BookmarksPage from "../pages/dashboards/student/Events/BookmarksPage";
import EventDetails from "../pages/dashboards/student/Events/EventDetails";
import RemindersTab from "../pages/dashboards/student/pages/Reminder/RemindersTab";
import TimeTable from "../pages/dashboards/student/component/TimeTable";
import MessagesTab from "../pages/Message/MessagesTab";
import Profile from "../pages/dashboards/student/pages/Profile/Profile";
import Settings from "../pages/dashboards/student/pages/Profile/Settings";
import SearchResults from "../pages/dashboards/student/search/SearchResults";

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
  // ✅ FIX: Now 'announcements' loads the actual AnnouncementsPage
  <Route
    key="announcements"
    path="announcements"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <AnnouncementsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <EventsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="bookmarks"
    path="bookmarks"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <BookmarksPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <EventDetails />
      </ProtectedRoute>
    }
  />,
  <Route
    key="search"
    path="search"
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <SearchResults />
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
