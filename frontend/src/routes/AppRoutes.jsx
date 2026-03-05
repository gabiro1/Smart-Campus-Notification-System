import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";

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

// Admin & Staff Pages
import AdminDashboard from "../pages/dashboards/admin/pages/Dashboard";
import UserManagement from "../pages/dashboards/admin/pages/UserManagement";
import HoDDashboard from "../pages/dashboards/hod/pages/HoDDashboard";
import LecturerDashboard from "../pages/dashboards/lecturer/pages/LecturerDashboard";
import CommitteePortal from "../pages/dashboards/studcommittee/pages/CommitteePortal";
import DeanDashboard from "../pages/dashboards/dean/pages/DeanDashboard";
import NotFound from "../pages/error/NotFound";
import { NotificationsTab } from "@/pages/dashboards/student/pages/Notifications/NotificationsTab";
// import { RemindersTab } from "@/pages/dashboards/student/pages/Reminder/RemindersTab";

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
      lecturer: "/lecturer/console",
      student: "/feed",
      guild_president: "/feed",
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

      {/* -------- STUDENT LAYOUT (ONLY ONE) -------- */}
      <Route element={<StudentLayout />}>
        <Route
          path="/feed"
          element={
            <ProtectedRoute allowedRoles={["student", "guild_president"]}>
              <EnhancedStudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/notifications" element={<ProtectedRoute allowedRoles={["student"]}> <NotificationsTab/></ProtectedRoute>}/> 

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
            <ProtectedRoute allowedRoles={["student", "guild_president"]}>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["student", "guild_president", "admin"]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/ai-summary"
          element={
            <ProtectedRoute allowedRoles={["student", "guild_president"]}>
              <AISummary />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={["student", "guild_president"]}>
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
            <ProtectedRoute allowedRoles={["student", "guild_president"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* -------- ADMIN / STAFF LAYOUT -------- */}
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
          path="/lecturer/console"
          element={
            <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
              <LecturerDashboard />
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
