import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

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
      class_rep: "/student/dashboard",
      guild_president: "/guild/overview",
    };
    return <Navigate to={roleRedirects[user.role] || "/login"} replace />;
  }

  return children;
}
