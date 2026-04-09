import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  Sparkles,
  Activity,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemedToaster from "../../../../components/ui/ThemedToaster";
import adminService from "../../../../services/adminService";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [academicStructure, setAcademicStructure] = useState({});

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoadingStructure(true);
        const data = await adminService.getHierarchy();
        setAcademicStructure(data.data || {});
      } catch (error) {
        console.error("Failed to fetch hierarchy:", error);
        toast.error("Failed to load academic structure");
      } finally {
        setLoadingStructure(false);
      }
    };
    fetchStructure();
  }, []);

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

  const availableSchools = useMemo(
    () => Object.keys(academicStructure[formData.targetCollege] || {}),
    [formData.targetCollege],
  );
  const availableDepartments = useMemo(
    () =>
      academicStructure[formData.targetCollege]?.[formData.targetSchool] || [],
    [formData.targetCollege, formData.targetSchool],
  );

  // --- MISSING FUNCTIONS ADDED HERE ---
  const handleCollegeChange = (e) => {
    setFormData({
      ...formData,
      targetCollege: e.target.value,
      targetSchool: "",
      targetDept: "",
    });
  };

  const handleSchoolChange = (e) => {
    setFormData({
      ...formData,
      targetSchool: e.target.value,
      targetDept: "",
    });
  };
  // ------------------------------------

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsParsingAI(true);
      toast.loading("Gemini AI reading flyer...", { id: "ai-parse" });
      const response = await adminService.parseFlyer(file);
      if (response.success && response.parsedData) {
        const aiData = response.parsedData;
        setFormData((prev) => ({
          ...prev,
          ...aiData,
          tags: aiData.tags ? aiData.tags.join(", ") : prev.tags,
        }));
        toast.success("Details extracted successfully!", { id: "ai-parse" });
      }
    } catch (error) {
      toast.error("AI parsing failed.", { id: "ai-parse" });
    } finally {
      setIsParsingAI(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
        targetLevel: formData.targetLevel ? Number(formData.targetLevel) : 0,
      };
      await adminService.createEvent(payload);
      toast.success("Event created successfully!");
      setTimeout(() => navigate("/admin/events"), 1500);
    } catch (error) {
      toast.error("Failed to create event");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
      <ThemedToaster />

      <div className="max-w-5xl mx-auto">
        {/* Back Arrow Navigation */}
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-xs font-bold uppercase tracking-widest bg-accent hover:bg-accent px-4 py-2 rounded-lg w-fit"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black tracking-tight">Create Event</h1>
          <p className="text-muted-foreground mt-2">
            Publish an event to the campus calendar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* AI Flyer Upload */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-[1px] rounded-[24px] bg-gradient-to-b from-blue-500/30 via-purple-500/10 to-transparent shadow-2xl sticky top-8"
            >
              <div className="bg-card rounded-[23px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                {isParsingAI ? (
                  <div className="flex flex-col items-center gap-4">
                    <Activity
                      className="animate-spin text-purple-400"
                      size={40}
                    />
                    <p className="text-sm font-bold text-purple-400 animate-pulse tracking-wide">
                      Gemini Vision parsing...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                      <Sparkles size={28} />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">
                      AI Flyer Auto-Fill
                    </h3>
                    <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                      Upload a poster. Our AI will automatically extract
                      details.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-accent hover:bg-accent text-foreground px-6 py-3 rounded-xl font-bold transition-all w-full flex justify-center gap-2"
                    >
                      <UploadCloud size={18} /> Select Image
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 bg-card border-border rounded-[24px] p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                  Event Title *
                </label>
                <input
                  required
                  placeholder="e.g. ICT Competition"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-background border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-background border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    Time *
                  </label>
                  <input
                    required
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full bg-background border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    Location *
                  </label>
                  <input
                    required
                    placeholder="e.g. Main Hall"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-background border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                  Description *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-background border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm resize-none text-foreground"
                />
              </div>

              <hr className="border-border my-8" />

              <div className="bg-blue-500/[0.02] border border-blue-500/10 p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-blue-500" /> Target
                  Audience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={formData.targetCollege}
                    onChange={handleCollegeChange}
                    className="bg-background border-border p-3.5 rounded-xl outline-none text-sm text-foreground cursor-pointer"
                  >
                    <option value="">All Colleges</option>
                    {Object.keys(academicStructure).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.targetSchool}
                    onChange={handleSchoolChange}
                    disabled={!formData.targetCollege}
                    className="bg-background border-border p-3.5 rounded-xl outline-none text-sm text-foreground cursor-pointer disabled:opacity-50"
                  >
                    <option value="">All Schools</option>
                    {availableSchools.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.targetDept}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDept: e.target.value })
                    }
                    disabled={!formData.targetSchool}
                    className="bg-background border-border p-3.5 rounded-xl outline-none text-sm text-foreground cursor-pointer disabled:opacity-50"
                  >
                    <option value="">All Departments</option>
                    {availableDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Level (e.g. 4) - Blank for all"
                    value={formData.targetLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, targetLevel: e.target.value })
                    }
                    className="bg-background border-border p-3.5 rounded-xl outline-none text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isParsingAI}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black tracking-widest uppercase text-sm hover:bg-blue-700 disabled:opacity-50 flex justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="animate-spin" size={20} /> Saving
                      Event...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} /> Publish Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
