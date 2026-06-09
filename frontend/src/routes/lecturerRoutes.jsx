import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const LecturerOverview = lazy(() => import("../pages/dashboards/lecturer/pages/Dashboard"));
const LecturerCreateAnnouncement = lazy(() => import("../pages/dashboards/lecturer/pages/CreateAnnouncement"));
const LecturerAnnouncements = lazy(() => import("../pages/dashboards/lecturer/pages/MyAnnouncements"));
const LecturerNotifications = lazy(() => import("../pages/dashboards/lecturer/pages/Notifications"));
const LecturerClasses = lazy(() => import("../pages/dashboards/lecturer/pages/MyClasses"));
const LecturerSettings = lazy(() => import("../pages/dashboards/lecturer/Settings"));
const LecturerAnnouncementQA = lazy(() => import("../pages/dashboards/lecturer/pages/AnnouncementQA"));
const MessagesTab = lazy(() => import("../features/communication/pages/MessagesTab"));
const GovernancePage = lazy(() => import("../pages/dashboards/shared/GovernancePage"));
const SupportPage = lazy(() => import("../pages/dashboards/shared/SupportPage"));
const CreatorDashboard = lazy(() => import("../features/events/pages/CreatorDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));
const LecturerTimetable = lazy(() => import("../pages/dashboards/lecturer/pages/LecturerTimetable"));

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
    key="timetable"
    path="timetable"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <LecturerTimetable />
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

  // ── EVENT APPLICATIONS ──
  <Route
    key="lecturer-events"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <div className="p-6 max-w-5xl mx-auto">
          <CreatorDashboard />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="lecturer-event-create"
    path="events/create"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="lecturer-event-details"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["lecturer"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
