import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const GuildOverview = lazy(() => import("../pages/dashboards/guild_president/pages/Overview"));
const GuildPostEvents = lazy(() => import("../pages/dashboards/guild_president/pages/PostEvents"));
const GuildNotifications = lazy(() => import("../pages/dashboards/guild_president/pages/Notifications"));
const GuildEngagement = lazy(() => import("../pages/dashboards/guild_president/pages/Engagement"));
const GuildMembers = lazy(() => import("../pages/dashboards/guild_president/pages/Members"));
const GuildSettings = lazy(() => import("../pages/dashboards/guild_president/pages/Settings"));
const ClassRepProposals = lazy(() => import("../pages/dashboards/guild_president/pages/ClassRepProposals"));
const MessagesTab = lazy(() => import("../features/communication/pages/MessagesTab"));
const GuildCouncilDashboard = lazy(() => import("../features/events/pages/GuildCouncilDashboard"));
const EventForm = lazy(() => import("../features/events/pages/EventForm"));
const EventDetailsPage = lazy(() => import("../features/events/pages/EventDetailsPage"));

export const guildRoutes = [
  <Route key="index" index element={<Navigate to="overview" replace />} />,
  <Route
    key="overview"
    path="overview"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildOverview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="post-events"
    path="post-events"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildPostEvents />
      </ProtectedRoute>
    }
  />,
  <Route
    key="notifications"
    path="notifications"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildNotifications />
      </ProtectedRoute>
    }
  />,
  <Route
    key="engagement"
    path="engagement"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildEngagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="members"
    path="members"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildMembers />
      </ProtectedRoute>
    }
  />,
  <Route
    key="settings"
    path="settings"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="class-reps"
    path="class-reps"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <ClassRepProposals />
      </ProtectedRoute>
    }
  />,
  <Route
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,

  // ── EVENT MODERATION DASHBOARD (NEW INSTITUTIONAL WORKFLOW) ──
  <Route
    key="event-moderation"
    path="events"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <GuildCouncilDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="event-publish"
    path="events/publish"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <div className="p-6 max-w-4xl mx-auto">
          <EventForm
            isDirectPublish={true}
            onSubmit={async (data) => {
              const { default: eventService } = await import('../services/eventService');
              await eventService.createAndPublish(data);
              window.location.href = '/guild/events';
            }}
            onCancel={() => window.location.href = '/guild/events'}
          />
        </div>
      </ProtectedRoute>
    }
  />,
  <Route
    key="event-details-guild"
    path="events/:eventId"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <EventDetailsPage />
      </ProtectedRoute>
    }
  />,
];
