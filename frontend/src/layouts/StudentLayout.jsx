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
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      setSidebarCollapsed(mobile || tablet);
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

  const effectiveCollapsed = sidebarCollapsed || isTablet;

  return (
    <div className="min-h-screen bg-card relative">
      <StudentNav 
        collapsed={effectiveCollapsed} 
        onToggle={toggleSidebar} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div 
        className={`flex-1 min-h-screen relative z-10 flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-14' : (effectiveCollapsed ? 'ml-16' : 'ml-56')
        }`}
      >
        <StudentHeader onToggleSidebar={toggleSidebar} collapsed={effectiveCollapsed} />
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