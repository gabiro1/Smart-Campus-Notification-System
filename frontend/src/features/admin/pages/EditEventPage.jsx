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
import toast from "react-hot-toast";
import ThemedToaster from "../../../components/ui/ThemedToaster";
import adminService from "../../../services/adminService";

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
    const fetchEventData = async () => {
      if (location.state?.event) {
        const ev = location.state.event;
        setFormData({
          title: ev.title || "",
          date: ev.date ? new Date(ev.date).toISOString().split("T")[0] : "",
          time: ev.time || "",
          location: ev.location || "",
          description: ev.description || "",
          tags: ev.tags ? ev.tags.join(", ") : "",
          targetCollege: ev.targetCollege || "",
          targetSchool: ev.targetSchool || "",
          targetDept: ev.targetDept || "",
          targetLevel: ev.targetLevel || "",
        });
      } else if (id) {
        try {
          const response = await adminService.getAllEvents(1, 1, { _id: id });
          if (response.data?.length > 0) {
            const ev = response.data[0];
            setFormData({
              title: ev.title || "",
              date: ev.date ? new Date(ev.date).toISOString().split("T")[0] : "",
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
        } catch (error) {
          console.error("Failed to fetch event:", error);
          toast.error("Failed to load event data");
        }
      }
    };

    fetchEventData();
  }, [location.state, id]);

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

      await adminService.updateEvent(id, payload);
      toast.success("Event updated successfully!");

      setTimeout(() => navigate("/admin/events"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update event");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-12 text-white">
      <ThemedToaster />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest bg-white/[0.02] border border-white/10 px-4 py-2 rounded-lg w-fit backdrop-blur-xl"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <CalendarDays className="text-amber-400" size={36} /> Edit Event
          </h1>
          <p className="text-neutral-400 mt-2">
            Modify the details of an existing calendar event.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                  Event Title *
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl focus:border-blue-500/50 outline-none text-sm text-white placeholder:text-neutral-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                    Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl focus:border-blue-500/50 outline-none text-sm text-white transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                    Time *
                  </label>
                  <input
                    required
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl focus:border-blue-500/50 outline-none text-sm text-white transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                  Location *
                </label>
                <input
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl focus:border-blue-500/50 outline-none text-sm text-white placeholder:text-neutral-600 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                  Description *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl focus:border-blue-500/50 outline-none text-sm resize-none text-white placeholder:text-neutral-600 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                  AI Match Tags (Comma separated)
                </label>
                <input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl focus:border-blue-500/50 outline-none text-sm text-white placeholder:text-neutral-600 transition-colors"
                />
              </div>

              <hr className="border-white/5 my-8" />

              <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl relative">
                {loadingStructure && (
                  <div className="absolute inset-0 z-10 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <Activity className="animate-spin text-blue-400" size={24} />
                  </div>
                )}
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-blue-400" /> Target
                  Audience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                      College
                    </label>
                    <select
                      value={formData.targetCollege}
                      onChange={handleCollegeChange}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl outline-none text-sm text-white cursor-pointer transition-colors focus:border-blue-500/50"
                    >
                      <option value="" className="bg-neutral-900">All Colleges</option>
                      {Object.keys(academicStructure).map((college) => (
                        <option key={college} value={college} className="bg-neutral-900">
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                      School
                    </label>
                    <select
                      value={formData.targetSchool}
                      onChange={handleSchoolChange}
                      disabled={!formData.targetCollege}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl outline-none text-sm text-white cursor-pointer disabled:opacity-50 transition-colors focus:border-blue-500/50"
                    >
                      <option value="" className="bg-neutral-900">
                        {formData.targetCollege
                          ? "All Schools"
                          : "Select a College First"}
                      </option>
                      {availableSchools.map((school) => (
                        <option key={school} value={school} className="bg-neutral-900">
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                      Department
                    </label>
                    <select
                      value={formData.targetDept}
                      onChange={(e) =>
                        setFormData({ ...formData, targetDept: e.target.value })
                      }
                      disabled={!formData.targetSchool}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl outline-none text-sm text-white cursor-pointer disabled:opacity-50 transition-colors focus:border-blue-500/50"
                    >
                      <option value="" className="bg-neutral-900">
                        {formData.targetSchool
                          ? "All Departments"
                          : "Select a School First"}
                      </option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept} className="bg-neutral-900">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                      Academic Level
                    </label>
                    <select
                      value={formData.targetLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, targetLevel: e.target.value })
                      }
                      className="w-full bg-white/[0.02] border border-white/10 p-4 rounded-xl outline-none text-sm text-white cursor-pointer transition-colors focus:border-blue-500/50"
                    >
                      <option value="" className="bg-neutral-900">All Levels</option>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <option key={level} value={level} className="bg-neutral-900">
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
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl font-black tracking-widest uppercase text-sm disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg transition-colors"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
