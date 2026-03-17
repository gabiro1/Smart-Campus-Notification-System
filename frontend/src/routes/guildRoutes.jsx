import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import GuildOverview from "../pages/dashboards/guild_president/pages/Overview";
import GuildPostEvents from "../pages/dashboards/guild_president/pages/PostEvents";
import GuildNotifications from "../pages/dashboards/guild_president/pages/Notifications";
import GuildEngagement from "../pages/dashboards/guild_president/pages/Engagement";
import GuildMembers from "../pages/dashboards/guild_president/pages/Members";
import GuildSettings from "../pages/dashboards/guild_president/pages/Settings";
import MessagesTab from "../pages/Message/MessagesTab";

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
    key="messages"
    path="messages"
    element={
      <ProtectedRoute allowedRoles={["guild_president"]}>
        <MessagesTab />
      </ProtectedRoute>
    }
  />,
];
