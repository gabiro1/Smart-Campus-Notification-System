import {
  LayoutDashboard,
  Bell,
  Calendar,
  Megaphone,
  Users,
  Shield,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Clock,
  BookOpen,
  MessageSquare,
  PlusCircle,
  Scale,
  Headphones,
  Mail,
  Activity,
  Globe,
  CheckSquare,
  PieChart,
  ShieldAlert,
  GraduationCap,
  UserPlus,
  FileText,
  ScrollText,
  AlertTriangle,
  ClipboardList,
  Zap,
  Database,
  HardDrive,
  Vote,
  UserCheck,
  Radio,
  Gauge,
  GitBranch,
  Command,
  Crown,
} from "lucide-react";

export const roleConfig = {
  student: {
    name: "Student Portal",
    roleLabel: "Student",
    icon: GraduationCap,
    sections: [
      {
        label: "Main",
        items: [
          { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard", end: true },
          { icon: Mail, label: "Messages", path: "/student/messages", badge: 'messages' },
          { icon: Calendar, label: "Events", path: "/student/events" },
        ],
      },
      {
        label: "Updates",
        items: [
          { icon: MessageSquare, label: "Notifications", path: "/student/notifications", badge: 'notifications' },
          { icon: Clock, label: "Reminders", path: "/student/reminders" },
        ],
      },
      {
        label: "Resources",
        items: [
          { icon: Clock, label: "Timetable", path: "/student/timetable" },
          { icon: BookOpen, label: "Academic", path: "/student/academic" },
          { icon: Users, label: "Clubs", path: "/student/clubs" },
        ],
      },
      {
        label: "Account",
        items: [
          { icon: Settings, label: "Settings", path: "/student/settings" },
        ],
      },
    ],
  },
  class_rep: {
    name: "Student Portal",
    roleLabel: "Class Representative",
    icon: Users,
    sections: [
      {
        label: "Main",
        items: [
          { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard", end: true },
          { icon: Mail, label: "Messages", path: "/student/messages", badge: 'messages' },
          { icon: Calendar, label: "Events", path: "/student/events" },
        ],
      },
      {
        label: "Updates",
        items: [
          { icon: MessageSquare, label: "Notifications", path: "/student/notifications", badge: 'notifications' },
          { icon: Clock, label: "Reminders", path: "/student/reminders" },
        ],
      },
      {
        label: "Resources",
        items: [
          { icon: Clock, label: "Timetable", path: "/student/timetable" },
          { icon: BookOpen, label: "Academic", path: "/student/academic" },
          { icon: Users, label: "Clubs", path: "/student/clubs" },
        ],
      },
      {
        label: "Account",
        items: [
          { icon: Settings, label: "Settings", path: "/student/settings" },
        ],
      },
    ],
  },
  admin: {
    name: "Admin Console",
    roleLabel: "Administrator",
    icon: Shield,
    sections: [
      {
        label: "Core",
        items: [
          { icon: LayoutDashboard, label: "Overview", path: "/admin/overview", end: true },
          { icon: Bell, label: "Notifications", path: "/admin/notifications", badge: 'notifications' },
          { icon: Radio, label: "Events", path: "/admin/events" },
        ],
      },
      {
        label: "Management",
        items: [
          { icon: Users, label: "Users", path: "/admin/users" },
          { icon: Shield, label: "Role Management", path: "/admin/roles" },
          { icon: Building2, label: "Academic Structure", path: "/admin/academic" },
          { icon: Calendar, label: "Timetable", path: "/admin/timetable" },
          { icon: Scale, label: "Governance", path: "/admin/governance" },
          { icon: FileText, label: "Role Assignments", path: "/admin/role-assignments" },
        ],
      },
      {
        label: "Administration",
        items: [
          { icon: Users, label: "HR Accounts", path: "/admin/hr-accounts" },
          { icon: Vote, label: "Council Election", path: "/admin/council-election" },
          { icon: Crown, label: "Guild Council", path: "/admin/guild-council" },
          { icon: AlertTriangle, label: "Emergency Override", path: "/admin/emergency" },
        ],
      },
      {
        label: "Analytics",
        items: [
          { icon: BarChart3, label: "Reports & Analytics", path: "/admin/analytics" },
          { icon: ClipboardList, label: "Audit Logs", path: "/admin/audit-logs" },
          { icon: Zap, label: "SMS Test", path: "/admin/sms-test" },
        ],
      },
      {
        label: "System",
        items: [
          { icon: Settings, label: "Core Settings", path: "/admin/settings" },
          { icon: Database, label: "Maintenance", path: "/admin/maintenance" },
          { icon: HardDrive, label: "Backups", path: "/admin/backups" },
          { icon: Headphones, label: "Support Tickets", path: "/admin/support" },
        ],
      },
    ],
  },
  lecturer: {
    name: "Lecturer Portal",
    roleLabel: "Lecturer",
    icon: BookOpen,
    sections: [
      {
        label: "Main",
        items: [
          { icon: LayoutDashboard, label: "Dashboard", path: "/lecturer/console" },
          { icon: Users, label: "My Classes", path: "/lecturer/classes" },
        ],
      },
      {
        label: "Academic",
        items: [
          { icon: Clock, label: "Timetable", path: "/lecturer/timetable" },
          { icon: Scale, label: "Governance", path: "/lecturer/governance" },
        ],
      },
      {
        label: "Communication",
        items: [
          { icon: Mail, label: "Messages", path: "/lecturer/messages", badge: 'messages' },
          { icon: Bell, label: "Notifications", path: "/lecturer/notifications", badge: 'notifications' },
        ],
      },
      {
        label: "System",
        items: [
          { icon: Headphones, label: "Support", path: "/lecturer/support" },
          { icon: Settings, label: "Settings", path: "/lecturer/settings" },
        ],
      },
    ],
  },
  hod: {
    name: "HOD Command Center",
    roleLabel: "Head of Department",
    icon: Building2,
    sections: [
      {
        label: "Operations Center",
        items: [
          { icon: Gauge, label: "Department Overview", path: "/hod/dashboard" },
          { icon: Scale, label: "Approvals", path: "/hod/governance" },
        ],
      },
      {
        label: "Communications",
        items: [
          { icon: Radio, label: "Broadcast", path: "/hod/broadcast" },
          { icon: FileText, label: "Announcements", path: "/hod/announcements" },
          { icon: Calendar, label: "Events", path: "/hod/events" },
          { icon: Mail, label: "Messages", path: "/hod/messages" },
        ],
      },
      {
        label: "Management",
        items: [
          { icon: Users, label: "Lecturers", path: "/hod/lecturers" },
        ],
      },
      {
        label: "System",
        items: [
          { icon: Bell, label: "Notifications", path: "/hod/notifications" },
          { icon: Settings, label: "Settings", path: "/hod/settings" },
        ],
      },
    ],
  },
  dean: {
    name: "Dean Portal",
    roleLabel: "Dean",
    icon: Globe,
    sections: [
      {
        label: "Operations",
        items: [
          { icon: Activity, label: "Command Center", path: "/dean/dashboard" },
          { icon: CheckSquare, label: "HoD Approvals", path: "/dean/approvals" },
          { icon: Radio, label: "School Broadcast", path: "/dean/broadcast" },
        ],
      },
      {
        label: "Communication",
        items: [
          { icon: Mail, label: "Messages", path: "/dean/messages", badge: 'messages' },
          { icon: FileText, label: "All Announcements", path: "/dean/announcements" },
        ],
      },
      {
        label: "System",
        items: [
          { icon: Settings, label: "Settings", path: "/dean/settings" },
        ],
      },
    ],
  },
  principal: {
    name: "Principal Console",
    roleLabel: "Principal",
    icon: ShieldAlert,
    sections: [
      {
        label: "Overview",
        items: [
          { icon: LayoutDashboard, label: "Executive Dashboard", path: "/principal/dashboard" },
        ],
      },
      {
        label: "Governance",
        items: [
          { icon: ShieldAlert, label: "Approvals", path: "/principal/approvals" },
          { icon: Building2, label: "Departments", path: "/principal/departments" },
          { icon: BarChart3, label: "Reports & Analytics", path: "/principal/reports-analytics" },
        ],
      },
      {
        label: "Management",
        items: [
          { icon: Shield, label: "Role Assignments", path: "/principal/role-assignments" },
          { icon: Users, label: "Student Leadership", path: "/principal/student-leadership" },
        ],
      },
      {
        label: "Communication",
        items: [
          { icon: Globe, label: "Broadcast Center", path: "/principal/broadcast" },
        ],
      },
      {
        label: "Events",
        items: [
          { icon: Calendar, label: "My Events", path: "/principal/my-events" },
          { icon: PlusCircle, label: "Create Event", path: "/principal/events/create" },
        ],
      },
    ],
  },
  guild_president: {
    name: "Guild Portal",
    roleLabel: "Guild President",
    icon: Vote,
    sections: [
      {
        label: "Main",
        items: [
          { icon: LayoutDashboard, label: "Overview", path: "/guild/overview" },
          { icon: Shield, label: "Event Moderation", path: "/guild/events" },
          { icon: Megaphone, label: "Post Events", path: "/guild/post-events" },
          { icon: Bell, label: "Notifications", path: "/guild/notifications" },
          { icon: Activity, label: "Engagement", path: "/guild/engagement" },
        ],
      },
      {
        label: "Management",
        items: [
          { icon: Users, label: "Members", path: "/guild/members" },
          { icon: MessageSquare, label: "Messages", path: "/guild/messages" },
        ],
      },
      {
        label: "System",
        items: [
          { icon: Users, label: "Class Reps", path: "/guild/class-reps" },
          { icon: Settings, label: "Settings", path: "/guild/settings" },
        ],
      },
    ],
  },
  registrar: {
    name: "Registrar Console",
    roleLabel: "Registrar",
    icon: GraduationCap,
    sections: [
      {
        label: "Overview",
        items: [
          { icon: LayoutDashboard, label: "Dashboard", path: "/registrar/dashboard" },
        ],
      },
      {
        label: "Student Management",
        items: [
          { icon: UserPlus, label: "New Student", path: "/registrar/new-student" },
          { icon: Users, label: "Student Records", path: "/registrar/students" },
        ],
      },
      {
        label: "Events",
        items: [
          { icon: Calendar, label: "Events", path: "/registrar/events" },
        ],
      },
      {
        label: "System",
        items: [
          { icon: Settings, label: "Settings", path: "/registrar/settings" },
        ],
      },
    ],
  },
  hr: {
    name: "HR Console",
    roleLabel: "HR Officer",
    icon: Users,
    sections: [
      {
        label: "Overview",
        items: [
          { icon: LayoutDashboard, label: "Dashboard", path: "/hr/dashboard" },
        ],
      },
      {
        label: "HR Operations",
        items: [
          { icon: GitBranch, label: "HR Workflow", path: "/hr/drafts" },
        ],
      },
      {
        label: "Events",
        items: [
          { icon: Calendar, label: "Events", path: "/hr/events" },
          { icon: PlusCircle, label: "Create Event", path: "/hr/events/create" },
        ],
      },
    ],
  },
};

export function getRoleConfig(role) {
  return roleConfig[role] || roleConfig.student;
}
