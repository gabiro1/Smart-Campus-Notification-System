import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import GuildOverview from "../pages/dashboards/guild_president/pages/Overview";
import GuildPostEvents from "../pages/dashboards/guild_president/pages/PostEvents";
import GuildNotifications from "../pages/dashboards/guild_president/pages/Notifications";
import GuildEngagement from "../pages/dashboards/guild_president/pages/Engagement";
import GuildMembers from "../pages/dashboards/guild_president/pages/Members";
import GuildSettings from "../pages/dashboards/guild_president/pages/Settings";
import ClassRepProposals from "../pages/dashboards/guild_president/pages/ClassRepProposals";
import MessagesTab from "../features/communication/pages/MessagesTab";

import GuildCouncilDashboard from "../features/events/pages/GuildCouncilDashboard";
import EventForm from "../features/events/pages/EventForm";
import EventDetailsPage from "../features/events/pages/EventDetailsPage";

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
