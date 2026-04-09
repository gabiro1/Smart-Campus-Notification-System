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
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

const tabs = [
  { id: "colleges", label: "Colleges", icon: Building2 },
  { id: "schools", label: "Schools", icon: School },
  { id: "departments", label: "Departments", icon: BookOpen },
  { id: "classes", label: "Classes", icon: Users },
  { id: "students", label: "Assign Students", icon: GraduationCap },
];

export default function AcademicStructure() {
  const [activeTab, setActiveTab] = useState("colleges");
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Users for assigning dean/principal/hod
  const [users, setUsers] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [collegesData, schoolsData, deptsData, classesData, usersData] = await Promise.all([
        adminService.getColleges().catch(() => []),
        adminService.getSchools().catch(() => []),
        adminService.getDepartments().catch(() => []),
        adminService.getClasses().catch(() => []),
        adminService.getUsers(1, 1000, {}).catch(() => ({ users: [] })),
      ]);
      setColleges(collegesData.data || collegesData || []);
      setSchools(schoolsData.data || schoolsData || []);
      setDepartments(deptsData.data || deptsData || []);
      setClasses(classesData.data || classesData || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get available users for each role
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
      }
        toast.success("Deleted successfully");
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
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
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove student");
    }
  };

  const renderStudentAssignment = () => {
    const unassignedStudents = users.filter(u => u.role === 'student' && !u.class);
    
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
                    <div key={student._id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div>
                        <p className="text-sm text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <button
                        onClick={() => assignStudentToClass(student._id)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-foreground px-3 py-1.5 rounded-lg"
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
                    <div key={student._id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div>
                        <p className="text-sm text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <button
                        onClick={() => removeStudentFromClass(student._id)}
                        className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded-lg"
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
      case "students":
        return renderStudentAssignment();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Academic Structure
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage colleges, schools, departments, and classes.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
        >
          <Plus size={18} /> Add {activeTab.slice(0, -1)}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-600 text-foreground shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                : "bg-accent text-muted-foreground hover:text-foreground hover:bg-accent"
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
                    <FormInput label="College Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. College of Science and Technology" />
                    <FormInput label="Code" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. CST" />
                    <FormSelect label="Assign Principal" value={formData.principal} onChange={(v) => setFormData({ ...formData, principal: v })}>
                      <option value="">Select User (will become Principal)</option>
                      {getPrincipals().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </FormSelect>
                    <p className="text-xs text-muted-foreground">Selecting a user will automatically change their role to Principal</p>
                  </>
                )}

                {activeTab === "schools" && (
                  <>
                    <FormInput label="School Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. School of ICT" />
                    <FormInput label="Code" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. SOICT" />
                    <FormSelect label="College" value={formData.college} onChange={(v) => setFormData({ ...formData, college: v })}>
                      <option value="">Select College</option>
                      {colleges.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </FormSelect>
                    <FormSelect label="Assign Dean" value={formData.dean} onChange={(v) => setFormData({ ...formData, dean: v })}>
                      <option value="">Select User (will become Dean)</option>
                      {getDeans().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </FormSelect>
                    <p className="text-xs text-muted-foreground">Selecting a user will automatically change their role to Dean</p>
                  </>
                )}

                {activeTab === "departments" && (
                  <>
                    <FormInput label="Department Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. Information Technology" />
                    <FormInput label="Code" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. IT" />
                    <FormSelect label="School" value={formData.school} onChange={(v) => setFormData({ ...formData, school: v })}>
                      <option value="">Select School</option>
                      {schools.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </FormSelect>
                    <FormSelect label="Assign HoD" value={formData.hod} onChange={(v) => setFormData({ ...formData, hod: v })}>
                      <option value="">Select User (will become HoD)</option>
                      {getHoDs().map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </FormSelect>
                    <p className="text-xs text-muted-foreground">Selecting a user will automatically change their role to HoD</p>
                  </>
                )}

                {activeTab === "classes" && (
                  <>
                    <FormInput label="Class Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. IT Year 1" />
                    <FormInput label="Code" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} placeholder="e.g. IT1" />
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

function FormInput({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">{label}</label>
      <input
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