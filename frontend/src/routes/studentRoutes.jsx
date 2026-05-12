import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// --- STUDENT IMPORTS ---
import Dashboard from "../pages/dashboards/student/pages/Dashboard/Dashboard";
import AnnouncementsPage from "../pages/dashboards/student/pages/announcement/AnnouncementsPage";
import NotificationsPage from "../pages/dashboards/student/pages/Notifications/NotificationsPage";
import EventsPage from "../pages/dashboards/student/Events/EventsPage";
import BookmarksPage from "../pages/dashboards/student/Events/BookmarksPage";
import EventDetails from "../pages/dashboards/student/Events/EventDetails";
import RemindersTab from "../pages/dashboards/student/pages/Reminder/RemindersTab";
import TimeTable from "../pages/dashboards/student/component/TimeTable";
import MessagesTab from "../pages/Message/MessagesTab";
import Settings from "../pages/dashboards/student/pages/settings/Settings";

// Communication Hub Imports
import CommunicationHub from "../pages/communication/CommunicationHub";
import InboxView from "../pages/communication/InboxView";
import ThreadView from "../pages/communication/ThreadView";
import ContactsPage from "../pages/communication/ContactsPage";
import OfficeDirectory from "../pages/communication/OfficeDirectory";

export const studentRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dash"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <Dashboard />
      </ProtectedRoute>
    }
  />,
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
  // Legacy routes → redirect to new Communication Hub
  <Route
    key="messages"
    path="messages"
    element={<Navigate to="/student/communication/inbox" replace />}
  />,
  <Route
    key="contacts"
    path="contacts"
    element={<Navigate to="/student/communication/contacts" replace />}
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
  // Communication Hub (new enterprise communication module)
  <Route
    key="communication"
    path="communication"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep"]}>
        <CommunicationHub />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="inbox" replace />} />
    <Route path="inbox" element={<InboxView />} />
    <Route path="inbox/:threadId" element={<ThreadView />} />
    <Route path="contacts" element={<ContactsPage />} />
    <Route path="offices" element={<OfficeDirectory />} />
    <Route path="offices/:officeId" element={<OfficeDirectory />} />
    <Route path="requests" element={<InboxView />} />
    <Route path="escalations" element={<InboxView />} />
    <Route path="archived" element={<InboxView />} />
    <Route path="ai" element={<InboxView />} />
  </Route>,
  // Redirect old /student/profile to /student/settings
  <Route
    key="profile-redirect"
    path="profile"
    element={<Navigate to="settings" replace />}
  />,
];
