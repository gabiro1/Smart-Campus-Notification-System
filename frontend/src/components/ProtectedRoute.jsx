import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const roleRedirects = {
      admin: "/admin/overview",
      dean: "/dean/dashboard",
      hod: "/hod",
      lecturer: "/lecturer",
      student: "/student/dashboard",
      // class_rep lives inside the student layout — same dashboard, extra creation powers
      class_rep: "/student/dashboard",
      guild_president: "/guild/overview",
    };
    return <Navigate to={roleRedirects[user.role] || "/login"} replace />;
  }

  return children;
}
