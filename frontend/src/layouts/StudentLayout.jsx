import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentNav from "../pages/dashboards/student/component/StudentNav";
import StudentHeader from "../pages/dashboards/student/component/StudentHeader";
import OnboardingWizard from "../components/onboarding/OnboardingWizard";
import { useAuth } from "../context/AuthContext";

export default function StudentLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <StudentNav
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div
        style={{ marginLeft: sidebarWidth }}
        className="flex flex-col min-h-screen transition-all duration-200 ease-in-out"
      >
        <StudentHeader onToggleSidebar={toggleSidebar} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {user?.role === "student" && !user?.hasCompletedOnboarding && (
        <OnboardingWizard />
      )}
    </div>
  );
}
