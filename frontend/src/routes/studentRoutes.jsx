import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const Dashboard = lazy(() => import("../pages/dashboards/student/pages/Dashboard/Dashboard"));
const NotificationsPage = lazy(() => import("../pages/dashboards/student/pages/Notifications/NotificationsPage"));
const EventsPage = lazy(() => import("../pages/dashboards/student/Events/EventsPage"));
const MyEventsPage = lazy(() => import("../pages/dashboards/student/Events/MyEventsPage"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));
const RemindersTab = lazy(() => import("../pages/dashboards/student/pages/Reminder/RemindersTab"));
const TimeTable = lazy(() => import("../pages/dashboards/student/component/TimeTable"));
const StudentMessages = lazy(() => import("../pages/dashboards/student/pages/Messages/StudentMessages"));
const Settings = lazy(() => import("../pages/dashboards/student/pages/settings/Settings"));


const CommunicationHub = lazy(() => import("../features/communication/pages/CommunicationHub"));
const InboxView = lazy(() => import("../features/communication/pages/InboxView"));
const ThreadView = lazy(() => import("../features/communication/pages/ThreadView"));
const ContactsPage = lazy(() => import("../features/communication/pages/ContactsPage"));
const OfficeDirectory = lazy(() => import("../features/communication/pages/OfficeDirectory"));

export const studentRoutes = [
  <Route key="index" index element={<Navigate to="dashboard" replace />} />,
  <Route
    key="dash"
    path="dashboard"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <Dashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <EventsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="event-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <MyEventsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="reminders"
    path="reminders"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <RemindersTab />
      </ProtectedRoute>
    }
  />,
  <Route
    key="timetable"
    path="timetable"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <TimeTable />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <StudentMessages />
      </ProtectedRoute>
    }
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
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <NotificationsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  // Communication Hub (new enterprise communication module)
  <Route
    key="communication"
    path="communication"
    element={
      <ProtectedRoute allowedRoles={["student", "class_rep", "guild_president"]}>
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
