import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";

// --- NEW: Guild President Layout & Pages ---
import GuildLayout from "../pages/dashboards/guild_president/Components/DashboardLayout";
import GuildOverview from "../pages/dashboards/guild_president/pages/Overview";
import GuildPostEvents from "../pages/dashboards/guild_president/pages/PostEvents";
import GuildNotifications from "../pages/dashboards/guild_president/pages/Notifications";
import GuildEngagement from "../pages/dashboards/guild_president/pages/Engagement";
import GuildMembers from "../pages/dashboards/guild_president/pages/Members";
import GuildSettings from "../pages/dashboards/guild_president/pages/Settings";

// --- NEW: Lecturer Layout & Pages ---
import LecturerLayout from "../pages/dashboards/lecturer/components/DashboardLayout";
import LecturerOverview from "../pages/dashboards/lecturer/pages/Dashboard";
import LecturerCreateAnnouncement from "../pages/dashboards/lecturer/pages/CreateAnnouncement";
import LecturerAnnouncements from "../pages/dashboards/lecturer/pages/MyAnnouncements";
import LecturerNotifications from "../pages/dashboards/lecturer/pages/Notifications";
import LecturerClasses from "../pages/dashboards/lecturer/pages/MyClasses";
import LecturerAnalytics from "../pages/dashboards/lecturer/pages/Analytics";
import LecturerSettings from "../pages/dashboards/lecturer/Settings";

// Public Pages
import Landing from "../pages/home/landing/pages/Landing";
import Features from "../pages/home/features/Features";
import HowItWorks from "../pages/home/howitworks/HowItWorks";
import About from "../pages/home/about/About";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Student Pages
import TimeTable from "../pages/dashboards/student/component/TimeTable";
import EnhancedStudentDashboard from "../pages/dashboards/student/pages/Dashboard/EnhancedStudentDashboard";
import Profile from "../pages/dashboards/student/pages/Profile/Profile";
import RemindersTab from "../pages/dashboards/student/pages/Reminder/RemindersTab";
import Settings from "../pages/dashboards/student/pages/Profile/Settings";
import Messages from "../pages/dashboards/student/pages/Message/Messages";
import EventFeedGrid from "../pages/dashboards/student/Events/EventFeedGrid";
import { NotificationsTab } from "@/pages/dashboards/student/pages/Notifications/NotificationsTab";

// Admin & Staff Pages
import AdminDashboard from "../pages/dashboards/admin/pages/Dashboard";
import UserManagement from "../pages/dashboards/admin/pages/UserManagement";
import HoDDashboard from "../pages/dashboards/hod/pages/HoDDashboard";
import CommitteePortal from "../pages/dashboards/studcommittee/pages/CommitteePortal";
import DeanDashboard from "../pages/dashboards/dean/pages/DeanDashboard";
import NotFound from "../pages/error/NotFound";

/* ---------------- PROTECTED ROUTE ---------------- */

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const roleRedirects = {
      admin: "/admin/dashboard",
      dean: "/dashboard/dean",
      hod: "/hod/dashboard",
      lecturer: "/lecturer", // <-- Updated redirect to new dashboard root
      student: "/feed",
      guild_president: "/guild/overview",
    };

    return <Navigate to={roleRedirects[user.role] || "/feed"} replace />;
  }

  return children;
};

/* ---------------- ROUTES ---------------- */

export default function AppRoutes() {
  return (
    <Routes>
      {/* -------- PUBLIC ROUTES -------- */}
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ========================================================= */}
      {/* -------- NEW: GUILD PRESIDENT LAYOUT & ROUTES ----------- */}
      {/* ========================================================= */}
      <Route element={<GuildLayout />}>
        <Route
          path="/guild/overview"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <GuildOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guild/post-events"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <GuildPostEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guild/notifications"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <GuildNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guild/engagement"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <GuildEngagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guild/members"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <GuildMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guild/settings"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <GuildSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ========================================================= */}
      {/* -------- NEW: LECTURER LAYOUT & ROUTES ------------------ */}
      {/* ========================================================= */}
      <Route element={<LecturerLayout />}>
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/create"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerCreateAnnouncement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/announcements"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/notifications"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/classes"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/analytics"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/settings"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ========================================================= */}
      {/* -------- STUDENT LAYOUT (ONLY ONE) ---------------------- */}
      {/* ========================================================= */}
      <Route element={<StudentLayout />}>
        <Route
          path="/feed"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EnhancedStudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <NotificationsTab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timetable"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <TimeTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EventFeedGrid />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reminders"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RemindersTab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ========================================================= */}
      {/* -------- ADMIN / STAFF LAYOUT --------------------------- */}
      {/* ========================================================= */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/dean"
          element={
            <ProtectedRoute allowedRoles={["dean", "admin"]}>
              <DeanDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod/dashboard"
          element={
            <ProtectedRoute allowedRoles={["hod", "admin"]}>
              <HoDDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/committee/portal"
          element={
            <ProtectedRoute allowedRoles={["guild_president"]}>
              <CommitteePortal />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* -------- FALLBACK -------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
