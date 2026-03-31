import { Outlet } from "react-router-dom";
import StudentNav from "../pages/dashboards/student/component/StudentNav";
import FloatingCopilot from "../components/FloatingCopilot";
import StudentHeader from "../pages/dashboards/student/component/StudentHeader"; // Ensure path is correct

export default function StudentLayout() {
  return (
    <div className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10 flex flex-col bg-[#050505]">
      {/* Persistent Top Bar for Notifications & Global Actions */}
      <StudentHeader />

      {/* Main Content Area - Overflows independently if needed */}
      <main className="flex-1 flex flex-col w-full h-full relative">
        <Outlet />
      </main>
      
      {/* Bottom Nav / Copilot Context */}
      <StudentNav />
      <FloatingCopilot />
    </div>
  );
}