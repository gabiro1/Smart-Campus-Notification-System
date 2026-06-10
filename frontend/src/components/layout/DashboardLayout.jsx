import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UniSidebar from "./UniSidebar";
import UniHeader from "./UniHeader";
import FloatingCopilot from "../FloatingCopilot";
import EmergencyBanner from "../common/EmergencyBanner";
import { useAuth } from "../../context/AuthContext";
import { getRoleConfig } from "./navigationConfig";

const pageTitles = {
  "/student/dashboard": "Dashboard",
  "/student/announcements": "Announcements",
  "/student/events": "Events",
  "/student/bookmarks": "Bookmarks",
  "/student/notifications": "Notifications",
  "/student/reminders": "Reminders",
  "/student/timetable": "Timetable",
  "/student/academic": "Academic",
  "/student/clubs": "Clubs",
  "/student/settings": "Settings",
  "/admin/overview": "Overview",
  "/admin/notifications": "Notifications",
  "/admin/events": "Events",
  "/admin/users": "Users",
  "/admin/roles": "Role Management",
  "/admin/academic": "Academic Structure",
  "/admin/timetable": "Timetable",
  "/admin/governance": "Governance",
  "/admin/role-assignments": "Role Assignments",
  "/admin/hr-accounts": "HR Accounts",
  "/admin/council-election": "Council Election",
  "/admin/emergency": "Emergency Override",
  "/admin/analytics": "Reports & Analytics",
  "/admin/audit-logs": "Audit Logs",
  "/admin/sms-test": "SMS Test",
  "/admin/settings": "Settings",
  "/admin/maintenance": "Maintenance",
  "/admin/backups": "Backups",
  "/admin/support": "Support Tickets",
  "/lecturer/console": "Dashboard",
  "/lecturer/create": "Create Announcement",
  "/lecturer/classes": "My Classes",
  "/lecturer/announcements": "Announcements",
  "/lecturer/qa": "Q&A",
  "/lecturer/timetable": "Timetable",
  "/lecturer/analytics": "Analytics",
  "/lecturer/governance": "Governance",
  "/lecturer/messages": "Messages",
  "/lecturer/notifications": "Notifications",
  "/lecturer/support": "Support",
  "/lecturer/settings": "Settings",
  "/hod/dashboard": "Command Center",
  "/hod/governance": "Approvals",
  "/hod/broadcast": "Broadcast",
  "/hod/announcements": "Announcements",
  "/hod/messages": "Messages",
  "/hod/lecturers": "Lecturers",
  "/hod/notifications": "Notifications",
  "/hod/settings": "Settings",
  "/dean/dashboard": "Command Center",
  "/dean/approvals": "HoD Approvals",
  "/dean/broadcast": "School Broadcast",
  "/dean/announcements": "Announcements",
  "/dean/roles": "Staff Oversight",
  "/dean/settings": "Settings",
  "/principal/dashboard": "Executive Dashboard",
  "/principal/approvals": "Approvals",
  "/principal/departments": "Departments",
  "/principal/reports-analytics": "Reports & Analytics",
  "/principal/role-assignments": "Role Assignments",
  "/principal/student-leadership": "Student Leadership",
  "/principal/broadcast": "Broadcast Center",
  "/principal/my-events": "My Events",
  "/guild/overview": "Overview",
  "/guild/events": "Event Moderation",
  "/guild/events/publish": "Publish Event",
  "/guild/post-events": "Post Events",
  "/guild/notifications": "Notifications",
  "/guild/engagement": "Engagement",
  "/guild/members": "Members",
  "/guild/messages": "Messages",
  "/guild/class-reps": "Class Reps",
  "/guild/settings": "Settings",
  "/registrar/dashboard": "Dashboard",
  "/registrar/new-student": "New Student",
  "/registrar/students": "Student Records",
  "/registrar/stats": "Enrollment Stats",
  "/registrar/events": "Events",
  "/hr/dashboard": "Dashboard",
  "/hr/drafts": "HR Workflow",
  "/hr/events": "Events",
};

export default function DashboardLayout({ role = "student" }) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const mod = await import("../../services/notificationService");
        const data = await mod.default.getUnreadCount();
        setUnreadCount(data?.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const config = getRoleConfig(role);

  // Find page title from config or lookup
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];

    for (const section of config.sections) {
      for (const item of section.items) {
        if (path.startsWith(item.path) && item.path !== "/") {
          return item.label;
        }
      }
    }
    return "Dashboard";
  }, [location.pathname, config]);

  const sidebarMargin = isMobile ? "ml-0" : sidebarCollapsed ? "ml-[72px]" : "ml-64";

  return (
    <div className={`min-h-screen bg-background text-foreground flex ${isMobile ? "overflow-x-hidden" : "overflow-hidden"}`}>
      {/* Ambient background glows */}
      <div className="fixed top-[-20%] left-[10%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar (desktop: collapsible, mobile: animated drawer) */}
      <UniSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        role={role}
        user={user || {}}
        unreadCount={unreadCount}
      />

      {/* Main Content Area with 3D Parallax effect on mobile */}
      <div
        className={`flex-1 flex flex-col relative z-10 h-screen overflow-hidden ${sidebarMargin}`}
        style={{
          perspective: isMobile ? "1200px" : undefined,
        }}
      >
        <div
          className="flex-1 flex flex-col h-full overflow-hidden bg-background"
          style={{
            transformOrigin: "90% center",
            willChange: isMobile && sidebarOpen ? "transform" : undefined,
            borderRadius: isMobile && sidebarOpen ? "32px" : "0px",
            boxShadow: isMobile && sidebarOpen ? "0 30px 60px rgba(0,0,0,0.5)" : "none",
            transform: isMobile && sidebarOpen
              ? "translateX(60%) scale(0.8) rotateY(-15deg)"
              : undefined,
            transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.5s ease, box-shadow 0.5s ease",
            pointerEvents: isMobile && sidebarOpen ? "none" : undefined,
          }}
        >
        {/* Header */}
        <UniHeader
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
          showMenuButton={isMobile}
          role={role}
        />

        {/* Emergency Banner */}
        <EmergencyBanner />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Copilot */}
        <FloatingCopilot />
      </div>
    </div>
    </div>
  );
}
