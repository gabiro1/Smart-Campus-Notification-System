import { Outlet } from "react-router-dom";
import StudentNav from "../pages/dashboards/student/component/StudentNav";

export default function StudentLayout() {
  return (
    <div className="flex-1 ml-20 md:ml-72 min-h-screen relative z-10 flex flex-col h-screen">
      {/* This is where the specific pages (Feed, Profile, etc.) will render */}
      <Outlet />
      {/* Persistent Navigation */}
      <StudentNav />
    </div>
  );
}
