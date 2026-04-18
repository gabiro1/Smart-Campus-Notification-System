import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Activity,
  Save,
  School,
  ArrowLeft,
  BookMarked,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

const tabs = [
  { id: "colleges", label: "Colleges", icon: Building2 },
  { id: "schools", label: "Schools", icon: School },
  { id: "departments", label: "Departments", icon: BookOpen },
  { id: "classes", label: "Classes", icon: Users },
  { id: "courses", label: "Courses", icon: BookMarked },
  { id: "lecturers", label: "Assign Lecturers", icon: UserCheck },
  { id: "students", label: "Assign Students", icon: GraduationCap },
];

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState("colleges");
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Users for assigning dean/principal/hod
  const [users, setUsers] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCourseAssignModalOpen, setIsCourseAssignModalOpen] = useState(false);
  const [selectedLecturerForAssign, setSelectedLecturerForAssign] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  
  // New user form state
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "", courseId: "" });
  const [userRoleToAssign, setUserRoleToAssign] = useState(""); // principal, dean, hod
  const [targetField, setTargetField] = useState(""); // principal, dean, hod

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [collegesData, schoolsData, deptsData, classesData, usersData, coursesData] = await Promise.all([
        adminService.getColleges().catch(() => []),
        adminService.getSchools().catch(() => []),
        adminService.getDepartments().catch(() => []),
        adminService.getClasses().catch(() => []),
        adminService.getUsers(1, 1000, {}, true).catch(() => ({ users: [] })),
        adminService.getCourses().catch(() => []),
      ]);
      setColleges(collegesData.data || collegesData || []);
      setSchools(schoolsData.data || schoolsData || []);
      setDepartments(deptsData.data || deptsData || []);
      setClasses(classesData.data || classesData || []);
      setUsers(usersData.users || []);
      setCourses(coursesData.data || coursesData || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get lecturers (users with role lecturer)
  const getLecturers = () => users.filter(u => u.role === 'lecturer').map(u => ({ value: u._id, label: u.name }));

  // Helper to get classes for a specific department
  const getClassesByDepartment = (deptId) => classes.filter(c => String(c.department?._id) === String(deptId));
  const getPrincipals = () => users.filter(u => !u.role || u.role === 'student' || u.role === 'lecturer').map(u => ({ value: u._id, label: u.name }));
  const getDeans = () => users.filter(u => !u.role || u.role === 'student' || u.role === 'lecturer').map(u => ({ value: u._id, label: u.name }));
  const getHoDs = () => users.filter(u => !u.role || u.role === 'student' || u.role === 'lecturer').map(u => ({ value: u._id, label: u.name }));

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(getInitialFormData(activeTab));
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData(getInitialFormData(activeTab, item));
    setIsModalOpen(true);
  };

  // Auto-generate code from name (e.g., "School of ICT" -> "SOICT")
  const generateCode = (name, tab = activeTab) => {
    if (!name) return "";
    // Remove common prefixes and get acronym of significant words
    const cleanName = name
      .replace(/^(school of|college of|department of|university of)\s+/i, "")
      .replace(/[^a-zA-Z0-9\s]/g, "");
    const words = cleanName.trim().split(/\s+/);
    const baseCode = words.length === 1 
      ? words[0].substring(0, 6).toUpperCase()
      : words.map(w => w[0]).join("").substring(0, 6).toUpperCase();
    
    // For courses, include class level (e.g., "Database Systems" + Year 1 -> "DS101")
    if (tab === "courses" && formData.class) {
      const selectedClass = classes.find(c => c._id === formData.class);
      const level = selectedClass?.level || "1";
      // Get course count for this class to generate unique number
      const classCourses = courses.filter(c => String(c.class?._id) === String(formData.class) || String(c.class) === String(formData.class));
      const courseNum = (classCourses.length + 1).toString().padStart(2, '0');
      return `${baseCode}${level}${courseNum}`;
    }
    
    return baseCode;
  };

  const handleNameChange = (name) => {
    setFormData((prev) => {
      const newCode = generateCode(name, activeTab);
      // Keep existing code if user manually entered one (not auto-generated)
      const isAutoGenerated = prev.code === generateCode(prev.name, activeTab);
      return {
        ...prev,
        name,
        code: isAutoGenerated ? newCode : prev.code,
      };
    });
  };
  
  // Update course code when class changes
  const handleClassChange = (classId) => {
    setFormData((prev) => {
      const newCode = generateCode(prev.name || "", "courses");
      const isAutoGenerated = prev.code === generateCode(prev.name || "", "courses");
      return {
        ...prev,
        class: classId,
        code: isAutoGenerated ? newCode : prev.code,
      };
    });
  };

  const getInitialFormData = (tab, item = null) => {
    switch (tab) {
      case "colleges":
        return { name: item?.name || "", code: item?.code || "", principal: item?.principal?._id || item?.principal || "" };
      case "schools":
        return { name: item?.name || "", code: item?.code || "", college: item?.college?._id || item?.college || "", dean: item?.dean?._id || item?.dean || "" };
      case "departments":
        return { name: item?.name || "", code: item?.code || "", school: item?.school?._id || item?.school || "", hod: item?.hod?._id || item?.hod || "" };
      case "classes":
        return {
          name: item?.name || "",
          code: item?.code || "",
          department: item?.department?._id || item?.department || "",
          level: item?.level || "",
          academicYear: item?.academicYear || new Date().getFullYear().toString(),
          semester: item?.semester || "1",
        };
      case "courses":
        return {
          name: item?.name || "",
          code: item?.code || "",
          class: item?.class?._id || item?.class || "",
          lecturer: item?.lecturer?._id || item?.lecturer || "",
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingItem) {
        switch (activeTab) {
          case "colleges":
            await adminService.updateCollege(editingItem._id, formData);
            break;
          case "schools":
            await adminService.updateSchool(editingItem._id, formData);
            break;
          case "departments":
            await adminService.updateDepartment(editingItem._id, formData);
            break;
          case "classes":
            await adminService.updateClass(editingItem._id, formData);
            break;
          case "courses":
            await adminService.updateCourse(editingItem._id, formData);
            break;
        }
        toast.success("Updated successfully");
      } else {
        switch (activeTab) {
          case "colleges":
            await adminService.createCollege(formData);
            break;
          case "schools":
            await adminService.createSchool(formData);
            break;
          case "departments":
            await adminService.createDepartment(formData);
            break;
          case "classes":
            await adminService.createClass(formData);
            break;
          case "courses":
            await adminService.createCourse(formData);
            break;
        }
        toast.success("Created successfully");
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    setLoading(true);
    try {
      switch (activeTab) {
        case "colleges":
          await adminService.deleteCollege(item._id);
          break;
        case "schools":
          await adminService.deleteSchool(item._id);
          break;
        case "departments":
          await adminService.deleteDepartment(item._id);
          break;
        case "classes":
          await adminService.deleteClass(item._id);
          break;
        case "courses":
          await adminService.deleteCourse(item._id);
          break;
      }
        toast.success("Deleted successfully");
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Create new user and assign role
  const handleCreateUserAndAssign = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const userData = {
        name: newUserForm.name,
        email: newUserForm.email,
        password: newUserForm.password,
        role: userRoleToAssign
      };
      const result = await adminService.createUser(userData);
      
      // If course is selected AND lecturer role, assign course to the new user
      if (newUserForm.courseId && userRoleToAssign === 'lecturer') {
        await adminService.updateCourse(newUserForm.courseId, { lecturer: result.user._id });
        toast.success(`Lecturer created and assigned to course`);
      } else {
        toast.success(`${userRoleToAssign === 'principal' ? 'Principal' : userRoleToAssign === 'dean' ? 'Dean' : userRoleToAssign === 'lecturer' ? 'Lecturer' : 'HoD'} created successfully`);
      }
      
      // Set the newly created user as the assigned person
      setFormData({ ...formData, [targetField]: result.user._id });
      setIsUserModalOpen(false);
      setNewUserForm({ name: "", email: "", password: "", courseId: "" });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Student assignment state
  const [selectedClass, setSelectedClass] = useState("");
  const [assignedStudents, setAssignedStudents] = useState([]);

  // Fetch assigned students when class is selected
  useEffect(() => {
    if (selectedClass) {
      const classItem = classes.find(c => c._id === selectedClass);
      setAssignedStudents(classItem?.students || []);
    } else {
      setAssignedStudents([]);
    }
  }, [selectedClass, classes]);

  const assignStudentToClass = async (studentId) => {
    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }
    try {
      await adminService.assignStudentToClass(selectedClass, studentId);
      toast.success("Student assigned to class");
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign student");
    }
  };

  const removeStudentFromClass = async (studentId) => {
    try {
      await adminService.removeStudentFromClass(selectedClass, studentId);
      toast.success("Student removed from class");
      // Update local state immediately for better UX
      setAssignedStudents(prev => prev.filter(s => (s._id || s) !== studentId));
      fetchAllData();
    } catch (error) {
      console.error("Remove student error:", error);
      toast.error(error.response?.data?.message || "Failed to remove student");
    }
  };

  const renderStudentAssignment = () => {
    // Get all assigned student IDs from classes
    const assignedStudentIds = new Set();
    classes.forEach(cls => {
      (cls.students || []).forEach(student => {
        assignedStudentIds.add(student._id || student);
      });
    });
    
    // Filter out students who are already assigned to any class
    const unassignedStudents = users.filter(u => u.role === 'student' && !assignedStudentIds.has(u._id));
    
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
          >
            <option value="">Select a class</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.department?.name})</option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Unassigned Students ({unassignedStudents.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {unassignedStudents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">All students are assigned</p>
                ) : (
                  unassignedStudents.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                      <div>
                        <p className="text-sm text-foreground font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <button
                        onClick={() => assignStudentToClass(student._id)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium"
                      >
                        Assign
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Assigned Students ({assignedStudents.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {assignedStudents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No students assigned</p>
                ) : (
                  assignedStudents.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                      <div>
                        <p className="text-sm text-foreground font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <button
                        onClick={() => removeStudentFromClass(student._id)}
                        className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

// Render lecturer assignment to courses/classes
  const renderLecturerAssignment = () => {
    const handleUnassignCourse = async (courseId, lecturerId) => {
      if (!confirm("Are you sure you want to unassign this lecturer from this course?")) return;
      setLoading(true);
      try {
        await adminService.updateCourse(courseId, { lecturer: "" });
        toast.success("Lecturer unassigned from course");
        fetchAllData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to unassign lecturer");
      } finally {
        setLoading(false);
      }
    };
    
    // Get lecturers (always show) + users with assigned courses
    const lecturers = users.filter(u => u.role === 'lecturer');
    const usersWithCourses = users.filter(u => {
      const hasCourse = courses.some(c => String(c.lecturer?._id || c.lecturer) === String(u._id));
      return hasCourse && u.role !== 'lecturer';
    });
    
    // Combine: lecturers + users with courses (who aren't already lecturers)
    const allRelevant = [...lecturers];
    usersWithCourses.forEach(u => {
      if (!allRelevant.some(r => r._id === u._id)) {
        allRelevant.push(u);
      }
    });
    
    // Sort: with courses first, then lecturers without courses
    const staffWithCourses = [];
    const staffWithoutCourses = [];
    
    allRelevant.forEach(staff => {
      const staffCourses = courses.filter(c => {
        const courseLecturerId = c.lecturer?._id || c.lecturer;
        return String(courseLecturerId) === String(staff._id);
      });
      if (staffCourses.length > 0) {
        staffWithCourses.push({ staff, courses: staffCourses });
      } else {
        staffWithoutCourses.push({ staff, courses: [] });
      }
    });
    
    const sorted = [...staffWithCourses, ...staffWithoutCourses];
    
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(({ staff, courses: staffCourses }) => (
            <div key={staff._id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {staff.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                  Assigned Courses ({staffCourses.length})
                </p>
                {staffCourses.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No courses assigned</p>
                ) : (
                  staffCourses.map(course => (
                    <div key={course._id} className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg text-xs">
                      <div className="flex-1">
                        <span className="text-white font-medium">{course.name}</span>
                        <span className="text-slate-400 ml-2">({course.class?.name || 'N/A'})</span>
                      </div>
                      <button
                        onClick={() => handleUnassignCourse(course._id, staff._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded-lg transition-colors ml-2"
                        title="Unassign from course"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => {
                  setSelectedLecturerForAssign(staff);
                  setIsCourseAssignModalOpen(true);
                }}
                className="w-full mt-3 py-2 text-xs font-medium text-blue-400 border border-blue-400/30 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Assign Course
              </button>
            </div>
          ))}
          
          {allRelevant.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No lecturers found. Create lecturer accounts first.</p>
            </div>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl">
            <p className="text-2xl font-bold text-blue-400">{allRelevant.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Lecturers</p>
          </div>
          <div className="bg-green-600/10 border border-green-600/20 p-4 rounded-xl">
            <p className="text-2xl font-bold text-green-400">{courses.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Courses</p>
          </div>
          <div className="bg-purple-600/10 border border-purple-600/20 p-4 rounded-xl">
            <p className="text-2xl font-bold text-purple-400">{classes.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Classes</p>
          </div>
        </div>
      </div>
    );
};
  const renderList = () => {
    switch (activeTab) {
      case "colleges":
        return colleges.map((college) => (
          <ListItem
            key={college._id}
            title={college.name}
            subtitle={`Code: ${college.code}`}
            badge={college.principal?.name || "No Principal"}
            extra={schools.filter((s) => String(s.college?._id) === String(college._id)).length + " Schools"}
            onEdit={() => openEditModal(college)}
            onDelete={() => handleDelete(college)}
          />
        ));
      case "schools":
        return schools.map((school) => (
          <ListItem
            key={school._id}
            title={school.name}
            subtitle={`Code: ${school.code}`}
            badge={school.dean?.name || "No Dean"}
            extra={departments.filter((d) => String(d.school?._id) === String(school._id)).length + " Depts"}
            onEdit={() => openEditModal(school)}
            onDelete={() => handleDelete(school)}
          />
        ));
      case "departments":
        return departments.map((dept) => (
          <ListItem
            key={dept._id}
            title={dept.name}
            subtitle={`Code: ${dept.code}`}
            badge={dept.hod?.name || "No HoD"}
            extra={dept.school?.college?.name || ""}
            onEdit={() => openEditModal(dept)}
            onDelete={() => handleDelete(dept)}
          />
        ));
      case "classes":
        return classes.map((cls) => (
          <ListItem
            key={cls._id}
            title={cls.name}
            subtitle={`Code: ${cls.code}`}
            badge={`Year ${cls.level}`}
            extra={cls.department?.name || ""}
            onEdit={() => openEditModal(cls)}
            onDelete={() => handleDelete(cls)}
          />
        ));
      case "courses":
        return courses.map((course) => (
          <ListItem
            key={course._id}
            title={course.name}
            subtitle={`Code: ${course.code}`}
            badge={course.lecturer?.name || "No Lecturer"}
            extra={course.class?.name || ""}
            onEdit={() => openEditModal(course)}
            onDelete={() => handleDelete(course)}
          />
        ));
      case "lecturers":
        return renderLecturerAssignment();
      case "students":
        return renderStudentAssignment();
      default:
        return null;
    }
  };

  // Handle add button click for different tabs
  const handleAddClick = () => {
    if (activeTab === "lecturers") {
      // Open user modal directly for creating lecturer
      setUserRoleToAssign("lecturer");
      setTargetField("lecturer");
      setIsUserModalOpen(true);
    } else {
      openAddModal();
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 w-full text-foreground">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Academic Structure
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage colleges, schools, departments, and classes.
          </p>
        </div>
        {activeTab !== "students" && (
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 w-full md:w-auto justify-center md:justify-start"
          >
            <Plus size={18} /> Add {activeTab === "lecturers" ? "Lecturer" : activeTab.slice(0, -1)}
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 pb-2 flex-wrap overflow-x-auto [&::-webkit-scrollbar]:hidden [&::-moz-scrollbar]:hidden [&::-ms-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                : "bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-600/50"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Activity className="animate-spin text-blue-500" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Loading...
            </span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {renderList()}
            {((activeTab === "colleges" && colleges.length === 0) ||
              (activeTab === "schools" && schools.length === 0) ||
              (activeTab === "departments" && departments.length === 0) ||
              (activeTab === "classes" && classes.length === 0)) && (
              <div className="p-12 text-center text-muted-foreground">
                No {activeTab} found. Click "Add" to create one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card p-8 rounded-2xl border border-border w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {activeTab === "colleges" && (
                  <>
                    <FormInput label="College Name" value={formData.name} onChange={handleNameChange} placeholder="e.g. College of Science and Technology" />
                    <FormInput label="Code (Auto-generated)" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. CST" />
                    <RoleAssignmentField
                      label="Assign Principal"
                      value={formData.principal}
                      onChange={(v) => setFormData({ ...formData, principal: v })}
                      users={getPrincipals()}
                      onCreateNew={() => {
                        setUserRoleToAssign("principal");
                        setTargetField("principal");
                        setIsUserModalOpen(true);
                      }}
                      placeholder="Select existing user (will become Principal)"
                    />
                  </>
                )}

                {activeTab === "schools" && (
                  <>
                    <FormInput label="School Name" value={formData.name} onChange={handleNameChange} placeholder="e.g. School of ICT" />
                    <FormInput label="Code (Auto-generated)" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. SOICT" />
                    <FormSelect label="College" value={formData.college} onChange={(v) => setFormData({ ...formData, college: v })}>
                      <option value="">Select College</option>
                      {colleges.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </FormSelect>
                    <RoleAssignmentField
                      label="Assign Dean"
                      value={formData.dean}
                      onChange={(v) => setFormData({ ...formData, dean: v })}
                      users={getDeans()}
                      onCreateNew={() => {
                        setUserRoleToAssign("dean");
                        setTargetField("dean");
                        setIsUserModalOpen(true);
                      }}
                      placeholder="Select existing user (will become Dean)"
                    />
                  </>
                )}

                {activeTab === "departments" && (
                  <>
                    <FormInput label="Department Name" value={formData.name} onChange={handleNameChange} placeholder="e.g. Information Technology" />
                    <FormInput label="Code (Auto-generated)" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. IT" />
                    <FormSelect label="School" value={formData.school} onChange={(v) => setFormData({ ...formData, school: v })}>
                      <option value="">Select School</option>
                      {schools.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </FormSelect>
                    <RoleAssignmentField
                      label="Assign HoD"
                      value={formData.hod}
                      onChange={(v) => setFormData({ ...formData, hod: v })}
                      users={getHoDs()}
                      onCreateNew={() => {
                        setUserRoleToAssign("hod");
                        setTargetField("hod");
                        setIsUserModalOpen(true);
                      }}
                      placeholder="Select existing user (will become HoD)"
                    />
                  </>
                )}

                {activeTab === "classes" && (
                  <>
                    <FormInput label="Class Name" value={formData.name} onChange={handleNameChange} placeholder="e.g. IT Year 1" />
                    <FormInput label="Code (Auto-generated)" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. IT1" />
                    <FormSelect label="Department" value={formData.department} onChange={(v) => setFormData({ ...formData, department: v })} options={departments.map(d => ({ value: d._id, label: d.name }))} />
                    <FormSelect label="Level/Year" value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} options={[
                      { value: "1", label: "Year 1" },
                      { value: "2", label: "Year 2" },
                      { value: "3", label: "Year 3" },
                      { value: "4", label: "Year 4" },
                      { value: "5", label: "Year 5" },
                    ]} />
                    <FormInput label="Academic Year" value={formData.academicYear} onChange={(v) => setFormData({ ...formData, academicYear: v })} placeholder="e.g. 2025-2026" />
                  </>
                )}

                {activeTab === "courses" && (
                  <>
                    <FormInput label="Course Name" value={formData.name} onChange={handleNameChange} placeholder="e.g. Database Systems" />
                    <FormInput label="Code (Auto-generated)" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. IT401" />
                    <FormSelect label="Class" value={formData.class} onChange={handleClassChange}>
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.department?.name})</option>
                      ))}
                    </FormSelect>
                    <p className="text-xs text-muted-foreground">Course code format: [DEPT][LEVEL][NUM] (e.g., IT401 = IT Dept Year 4 Course 01)</p>
                    <RoleAssignmentField
                      label="Assign Lecturer"
                      value={formData.lecturer}
                      onChange={(v) => setFormData({ ...formData, lecturer: v })}
                      users={getLecturers()}
                      onCreateNew={() => {
                        setUserRoleToAssign("lecturer");
                        setTargetField("lecturer");
                        setIsUserModalOpen(true);
                      }}
                      placeholder="Select existing user (will become Lecturer)"
                    />
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingItem ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New User Creation Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card p-8 rounded-2xl border border-border w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Create New {userRoleToAssign === 'principal' ? 'Principal' : userRoleToAssign === 'dean' ? 'Dean' : userRoleToAssign === 'lecturer' ? 'Lecturer' : 'HoD'}
                </h2>
                <button onClick={() => setIsUserModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateUserAndAssign(); }}>
                <FormInput label="Full Name" value={newUserForm.name} onChange={(v) => setNewUserForm({ ...newUserForm, name: v })} placeholder="e.g. Dr. John Smith" />
                <FormInput label="Email Address" value={newUserForm.email} onChange={(v) => setNewUserForm({ ...newUserForm, email: v })} placeholder="e.g. john.smith@university.edu" />
                <FormInput label="Temporary Password" value={newUserForm.password} onChange={(v) => setNewUserForm({ ...newUserForm, password: v })} placeholder="Enter a secure password" type="password" />
                
                {userRoleToAssign === "lecturer" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                      Assign Course (Optional)
                    </label>
                    <select
                      value={newUserForm.courseId || ""}
                      onChange={(e) => setNewUserForm({ ...newUserForm, courseId: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Select a course (optional)</option>
                      {courses.filter(c => !c.lecturer || !c.lecturer._id).map(course => (
                        <option key={course._id} value={course._id}>
                          {course.name} ({course.code}) - {course.class?.name || 'No Class'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">You can assign a course now or later</p>
                  </div>
                )}
                
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <p className="text-sm text-blue-400 font-medium">
                    This user will be created with the role: <span className="font-bold uppercase">{userRoleToAssign}</span>
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-500 text-foreground px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                    Create & Assign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Course to Lecturer Modal */}
      <AnimatePresence>
        {isCourseAssignModalOpen && selectedLecturerForAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card p-8 rounded-2xl border border-border w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Assign Course to Lecturer
                </h2>
                <button onClick={() => setIsCourseAssignModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {selectedLecturerForAssign.name?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedLecturerForAssign.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedLecturerForAssign.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                    Available Courses (No Lecturer)
                  </p>
                  {(() => {
                    // Get courses without lecturer
                    const unassignedCourses = courses.filter(c => !c.lecturer || !c.lecturer._id);
                    if (unassignedCourses.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          All courses already have lecturers assigned
                        </p>
                      );
                    }
                    return unassignedCourses.map(course => (
                      <button
                        key={course._id}
                        onClick={async () => {
                          try {
                            setLoading(true);
                            await adminService.updateCourse(course._id, { lecturer: selectedLecturerForAssign._id });
                            toast.success(`Assigned ${course.name} to lecturer`);
                            setIsCourseAssignModalOpen(false);
                            fetchAllData();
                          } catch (error) {
                            toast.error(error.response?.data?.message || "Failed to assign course");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-blue-600/20 border border-slate-600/30 hover:border-blue-500/50 rounded-xl transition-all text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{course.name}</p>
                          <p className="text-xs text-slate-400">{course.code} • {course.class?.name || 'N/A'}</p>
                        </div>
                        <Plus size={16} className="text-blue-400" />
                      </button>
                    ));
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCourseAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListItem({ title, subtitle, badge, extra, onEdit, onDelete }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-accent transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">{badge}</p>
          <p className="text-xs text-muted-foreground">{extra}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
      >
        {children}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function RoleAssignmentField({ label, value, onChange, users, onCreateNew, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">{label}</label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {users.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onCreateNew}
          className="px-4 py-3 bg-green-600 hover:bg-green-500 text-foreground rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
        >
          <Plus size={16} />
          New
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Select an existing user OR create a new one</p>
    </div>
  );
}