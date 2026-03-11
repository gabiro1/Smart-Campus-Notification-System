import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import adminService from "../../../../services/adminService"; // Adjust path

export default function EditEventPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [academicStructure, setAcademicStructure] = useState({});

  // Initialize form with data passed from the router (if available)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    tags: "",
    targetCollege: "",
    targetSchool: "",
    targetDept: "",
    targetLevel: "",
  });

  // Pre-fill form if event data was passed
  useEffect(() => {
    if (location.state?.event) {
      const ev = location.state.event;
      setFormData({
        title: ev.title || "",
        date: ev.date ? new Date(ev.date).toISOString().split("T")[0] : "", // Format YYYY-MM-DD
        time: ev.time || "",
        location: ev.location || "",
        description: ev.description || "",
        tags: ev.tags ? ev.tags.join(", ") : "",
        targetCollege: ev.targetCollege || "",
        targetSchool: ev.targetSchool || "",
        targetDept: ev.targetDept || "",
        targetLevel: ev.targetLevel || "",
      });
    }
  }, [location.state]);

  // Fetch Hierarchy
  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const data = await adminService.getHierarchy();
        setAcademicStructure(data || {});
      } catch (error) {
        toast.error("Failed to load academic departments.");
      } finally {
        setLoadingStructure(false);
      }
    };
    fetchStructure();
  }, []);

  // Cascading Logic
  const availableSchools = useMemo(
    () => Object.keys(academicStructure[formData.targetCollege] || {}),
    [formData.targetCollege, academicStructure],
  );
  const availableDepartments = useMemo(
    () =>
      academicStructure[formData.targetCollege]?.[formData.targetSchool] || [],
    [formData.targetCollege, formData.targetSchool, academicStructure],
  );

  const handleCollegeChange = (e) =>
    setFormData({
      ...formData,
      targetCollege: e.target.value,
      targetSchool: "",
      targetDept: "",
    });
  const handleSchoolChange = (e) =>
    setFormData({ ...formData, targetSchool: e.target.value, targetDept: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        targetLevel:
          formData.targetLevel === "" ? 0 : Number(formData.targetLevel),
      };

      // Ensure you have an updateEvent method in adminService
      await adminService.updateEvent(id, payload);
      toast.success("Event updated successfully!");

      setTimeout(() => navigate("/admin/events"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update event");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12">
      <Toaster theme="dark" position="top-right" />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <CalendarDays className="text-amber-500" size={36} /> Edit Event
          </h1>
          <p className="text-neutral-500 mt-2">
            Modify the details of an existing calendar event.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D0D0D] border border-white/5 rounded-[24px] p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... EXACT SAME FORM INPUTS AS CreateEventPage.jsx ... */}
            {/* I am compressing this section for brevity, just copy the exact inputs from CreateEventPage */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                Event Title *
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl focus:border-blue-500 outline-none text-sm transition-colors text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                  Date *
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl focus:border-blue-500 outline-none text-sm transition-colors text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                  Time *
                </label>
                <input
                  required
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl focus:border-blue-500 outline-none text-sm transition-colors text-white [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                Location *
              </label>
              <input
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                Description *
              </label>
              <textarea
                required
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl focus:border-blue-500 outline-none text-sm resize-none text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                AI Match Tags (Comma separated)
              </label>
              <input
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
              />
            </div>

            <hr className="border-white/5 my-8" />

            <div className="bg-blue-500/[0.02] border border-blue-500/10 p-6 rounded-2xl relative">
              {loadingStructure && (
                <div className="absolute inset-0 z-10 bg-[#0D0D0D]/80 backdrop-blur-sm flex items-center justify-center">
                  <Activity className="animate-spin text-blue-500" size={24} />
                </div>
              )}
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-blue-500" /> Target
                Audience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                    College
                  </label>
                  <select
                    value={formData.targetCollege}
                    onChange={handleCollegeChange}
                    className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl outline-none text-sm text-white"
                  >
                    <option value="">All Colleges</option>
                    {Object.keys(academicStructure).map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                    School
                  </label>
                  <select
                    value={formData.targetSchool}
                    onChange={handleSchoolChange}
                    disabled={!formData.targetCollege}
                    className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl outline-none text-sm text-white disabled:opacity-50"
                  >
                    <option value="">
                      {formData.targetCollege
                        ? "All Schools"
                        : "Select a College First"}
                    </option>
                    {availableSchools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                    Department
                  </label>
                  <select
                    value={formData.targetDept}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDept: e.target.value })
                    }
                    disabled={!formData.targetSchool}
                    className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl outline-none text-sm text-white disabled:opacity-50"
                  >
                    <option value="">
                      {formData.targetSchool
                        ? "All Departments"
                        : "Select a School First"}
                    </option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                    Academic Level
                  </label>
                  <select
                    value={formData.targetLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, targetLevel: e.target.value })
                    }
                    className="w-full bg-[#141414] border border-white/5 p-4 rounded-xl outline-none text-sm text-white"
                  >
                    <option value="">All Levels</option>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>
                        Level {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 text-white py-4 rounded-xl font-black tracking-widest uppercase text-sm hover:bg-amber-700 disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="animate-spin" size={20} /> Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
