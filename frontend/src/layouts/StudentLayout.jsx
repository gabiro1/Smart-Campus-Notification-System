import { Outlet } from "react-router-dom";
import StudentNav from "../pages/dashboards/student/component/StudentNav";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 pb-24">
      {/* This is where the specific pages (Feed, Profile, etc.) will render */}
      <Outlet />
      {/* Persistent Navigation */}
      <StudentNav />
    </div>
  );
}
