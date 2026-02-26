import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";

// Public / Marketing Pages
import Landing from "../pages/home/landing/pages/Landing";
import Features from "../pages/home/features/Features";
import HowItWorks from "../pages/home/howitworks/HowItWorks";
import About from "../pages/home/about/About";
// import Pricing from "../pages/home/landing/pages/Pricing";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Student Features
import StudentFeed from "../pages/student/pages/Home";
import Profile from "../pages/student/pages/Profile";
import AISummary from "../pages/student/pages/AISummary";
import Reminders from "../pages/student/pages/Reminders";
import Departments from "../pages/student/pages/Departments";
import Settings from "../pages/student/pages/Settings";
import SearchResults from "../pages/student/pages/SearchResults";
// import Notifications from "../pages/student/component/";

// Professional Portals (Staff/Committee)
import AdminDashboard from "../pages/admin/pages/Dashboard";
import UserManagement from "../pages/admin/pages/UserManagement";
import BroadcastHistory from "../pages/admin/pages/BroadcastHistory";
import HoDDashboard from "../pages/hod/pages/HoDDashboard";
import LecturerDashboard from "../pages/lecturer/pages/LecturerDashboard";
import CommitteePortal from "../pages/studcommittee/pages/CommitteePortal";
import CreateEvent from "../pages/admin/pages/CreateEvent";
import Analytics from "../pages/admin/pages/Analytics";

// Error Pages
import NotFound from "../pages/error/NotFound";

export default function AppRoutes() {
  // Mock user - Logic: This should come from a useAuth() hook
  const user = { role: "StudCommittee", sub_role: "Speaker" };

  return (
    <Routes>
      {/* --- PUBLIC MARKETING ROUTES --- */}
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      {/* <Route path="/pricing" element={<Pricing />} /> */}

      {/* --- AUTHENTICATION --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- STUDENT ECOSYSTEM (Mobile-First / Bottom Nav) --- */}
      <Route element={<StudentLayout />}>
        <Route path="/feed" element={<StudentFeed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-summary" element={<AISummary />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<SearchResults />} />
        {/* <Route path="/notifications" element={<Notifications />} /> */}
      </Route>

      {/* --- STAFF & COMMITTEE ECOSYSTEM (Desktop / Sidebar) --- */}
      <Route element={<AdminLayout />}>
        {/* System Admin */}

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/history" element={<BroadcastHistory />} />
        <Route path="/admin/create" element={<CreateEvent />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Academic Management (HoD) */}
        <Route path="/hod/dashboard" element={<HoDDashboard />} />

        {/* Faculty (Lecturer) */}
        <Route path="/lecturer/console" element={<LecturerDashboard />} />

        {/* Student Committee (Speaker/President/Ministers) */}
        <Route
          path="/committee/portal"
          element={<CommitteePortal user={user} />}
        />
      </Route>

      {/* --- 404 CATCH-ALL --- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
