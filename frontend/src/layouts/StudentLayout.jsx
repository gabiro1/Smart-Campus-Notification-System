import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentNav from "../pages/dashboards/student/component/StudentNav";
import FloatingCopilot from "../components/FloatingCopilot";
import StudentHeader from "../pages/dashboards/student/component/StudentHeader"; 
import OnboardingWizard from "../components/onboarding/OnboardingWizard";
import { useAuth } from "../context/AuthContext";
import EmergencyBanner from "../components/common/EmergencyBanner";

export default function StudentLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-card relative">
      <StudentNav 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div 
        className={`flex-1 min-h-screen relative z-10 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-16' : (sidebarCollapsed ? 'ml-20' : 'ml-56')
        }`}
      >
        <StudentHeader onToggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
        <EmergencyBanner />
        <main className="flex-1 flex flex-col w-full h-full relative pt-2">
          <Outlet />
        </main>
        <FloatingCopilot />
      </div>

      {user?.role === 'student' && !user?.hasCompletedOnboarding && <OnboardingWizard />}
    </div>
  );
}