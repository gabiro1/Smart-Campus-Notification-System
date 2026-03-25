import { useState, useRef } from "react";
import GlassCard from "../components/GlassCard";
import { 
  ImagePlus, Loader2, FileText, LayoutTemplate, ShieldAlert, AlertTriangle, Info, Check, X, Shield, Users ,CheckCircle 
} from "lucide-react";
import eventService from "../../../../services/eventService";
import { useToast } from "../../../../components/ui/ToastContext";

export default function CreatePulse() {
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    attachmentUrl: "",
    isEmergency: false,
    approvalLevel: "department" // "department" | "school" | "college"
  });

  const [recipients, setRecipients] = useState(["Students", "Year 1"]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGovernanceSelect = (level) => {
    setFormData({ ...formData, approvalLevel: level });
  };

  // Mock upload logic just to populate the preview for the user
  const handleFileUpload = (file, type) => {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    if (type === 'image') {
      setFormData(prev => ({ ...prev, posterUrl: localUrl }));
      showToast("Image attached to pulse.", "success");
    } else {
      setFormData(prev => ({ ...prev, attachmentUrl: localUrl }));
      showToast("PDF Syllabus attached.", "success");
    }
  };

  const removeRecipient = (indexToRemove) => {
    setRecipients(recipients.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast("Pulse Headline and Detailed Information are required.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        isEmergency: formData.isEmergency,
        approvalLevel: formData.approvalLevel,
        targetDept: recipients.includes("Department") ? "CompSci" : undefined,
        tags: recipients,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" }),
      };

      await eventService.createEvent(payload);
      showToast("Pulse Broadcast deployed successfully!", "success");

      // Reset
      setFormData({
        title: "",
        description: "",
        posterUrl: "",
        attachmentUrl: "",
        isEmergency: false,
        approvalLevel: "department"
      });
      setRecipients(["Students", "Year 1"]);
    } catch (error) {
      console.error("Failed to deploy pulse:", error);
      showToast(error.response?.data?.message || "Failed to deploy broadcast.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen text-slate-200">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 font-sans">
          Create Pulse
        </h1>
        <p className="text-[#8B92A5] text-lg font-medium">
          Broadcast hyper-targeted academic intelligence across the campus nexus.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-12">
        
        {/* === FORM SIDE === */}
        <div className="space-y-8">
          
          {/* PULSE HEADLINE */}
          <div>
            <label className="block text-xs font-bold text-[#8B92A5] mb-2 tracking-widest uppercase">
              Pulse Headline
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[#1A1D24] border border-[#2A2E39] rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all placeholder:text-[#4A5060] text-lg font-medium"
              placeholder="e.g. Advanced Quantum Mechanics Seminar Rescheduled"
            />
          </div>

          {/* DETAILED INFORMATION */}
          <div>
            <label className="block text-xs font-bold text-[#8B92A5] mb-2 tracking-widest uppercase">
              Detailed Information
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Synthesize the core message for the AI engine..."
              className="w-full bg-[#1A1D24] border border-[#2A2E39] rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all placeholder:text-[#4A5060] resize-none text-base"
            />
          </div>

          {/* CHOOSE RECIPIENTS */}
          <div>
            <label className="block text-xs font-bold text-[#8B92A5] mb-2 tracking-widest uppercase">
              Choose Recipients
            </label>
            <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-3 flex flex-wrap gap-2 items-center">
              {recipients.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#0B2E26] border border-[#10B981]/30 text-[#10B981] px-3 py-1.5 rounded-lg text-sm font-semibold">
                  {rec}
                  <button onClick={() => removeRecipient(idx)} className="hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  if (!recipients.includes("New Filter")) setRecipients([...recipients, "New Filter"]);
                }}
                className="flex items-center gap-2 text-[#8B92A5] hover:text-white bg-[#2A2E39]/40 hover:bg-[#2A2E39] px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border border-transparent"
              >
                + Add Filter
              </button>
            </div>
          </div>

          {/* GOVERNANCE LEVEL */}
          <div>
            <label className="block text-xs font-bold text-[#8B92A5] mb-2 tracking-widest uppercase">
              Governance Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "department", label: "DEPT", icon: LayoutTemplate, activeColor: "text-[#10B981]", activeBorder: "border-[#10B981]", activeBg: "bg-[#10B981]/5" },
                { id: "school", label: "SCHOOL", icon: Shield, activeColor: "text-[#3B82F6]", activeBorder: "border-[#3B82F6]", activeBg: "bg-[#3B82F6]/5" },
                { id: "college", label: "COLLEGE", icon: Users, activeColor: "text-[#F59E0B]", activeBorder: "border-[#F59E0B]", activeBg: "bg-[#F59E0B]/5" }
              ].map((level) => {
                const isActive = formData.approvalLevel === level.id;
                const Icon = level.icon;
                return (
                  <button
                    key={level.id}
                    onClick={() => handleGovernanceSelect(level.id)}
                    className={`flex flex-col items-center justify-center py-6 rounded-xl border-2 transition-all duration-200 ${
                      isActive 
                        ? `${level.activeBorder} ${level.activeBg} ${level.activeColor}` 
                        : "border-[#1A1D24] bg-[#1A1D24] text-[#4A5060] hover:border-[#2A2E39] hover:text-[#8B92A5]"
                    }`}
                  >
                    <Icon size={28} className="mb-3" />
                    <span className="text-sm font-bold tracking-wider">{level.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="grid grid-cols-2 gap-4">
            <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'image')} />
            <input type="file" ref={pdfInputRef} accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')} />
            
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-[#2A2E39] hover:border-[#4A5060] bg-[#1A1D24]/50 rounded-xl py-8 flex flex-col items-center justify-center text-[#8B92A5] hover:text-white transition-all group"
            >
              <ImagePlus size={24} className="mb-3 text-[#4A5060] group-hover:text-white transition-colors" />
              <span className="text-xs font-bold tracking-wider">ATTACH IMAGE</span>
            </button>

            <button 
              onClick={() => pdfInputRef.current?.click()}
              className="border-2 border-dashed border-[#2A2E39] hover:border-[#4A5060] bg-[#1A1D24]/50 rounded-xl py-8 flex flex-col items-center justify-center text-[#8B92A5] hover:text-white transition-all group"
            >
              <FileText size={24} className="mb-3 text-[#4A5060] group-hover:text-white transition-colors" />
              <span className="text-xs font-bold tracking-wider">ATTACH PDF SYLLABUS</span>
            </button>
          </div>

          {/* EMERGENCY OVERRIDE */}
          <div className={`border-2 rounded-xl p-6 flex items-center justify-between transition-colors duration-300 ${formData.isEmergency ? 'border-red-500/50 bg-red-500/5' : 'border-[#1A1D24] bg-[#1A1D24]'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${formData.isEmergency ? 'bg-red-500/20 text-red-500' : 'bg-[#2A2E39] text-[#8B92A5]'}`}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className={`text-base font-bold mb-1 ${formData.isEmergency ? 'text-red-500' : 'text-white'}`}>Emergency Override</h4>
                <p className={`text-xs font-bold tracking-wider ${formData.isEmergency ? 'text-red-500/70' : 'text-[#4A5060]'}`}>BYPASSES MUTE SETTINGS & AI FILTERS</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={() => setFormData(prev => ({ ...prev, isEmergency: !prev.isEmergency }))}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${formData.isEmergency ? 'bg-red-500' : 'bg-[#2A2E39]'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.isEmergency ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-lg py-5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : null}
            {isSubmitting ? "Broadcasting..." : "Send Broadcast"}
          </button>
        </div>

        {/* === LIVE PREVIEW SIDE === */}
        <div className="space-y-4 hidden xl:block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#8B92A5] tracking-widest uppercase">
              Live Pulse Preview
            </h3>
            <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold tracking-wider">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              REAL-TIME SYNC
            </div>
          </div>

          {/* Mobile Phone Mockup Card */}
          <div className="bg-[#12141A] rounded-[2rem] border border-[#2A2E39] overflow-hidden shadow-2xl relative max-w-sm mx-auto">
            {/* Image Header */}
            <div className="h-56 bg-gradient-to-br from-[#10B981]/20 to-[#0A0A0A] relative w-full overflow-hidden">
              {formData.posterUrl ? (
                <img src={formData.posterUrl} className="w-full h-full object-cover opacity-60 mix-blend-screen" alt="Preview Pulse" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
                </div>
              )}
              {/* Overlay Badge */}
              <div className="absolute top-4 right-4 bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                <span className="text-[10px] font-bold text-white tracking-wider">98% AI MATCH</span>
              </div>
            </div>

            <div className="p-6 relative">
              {/* Badges row */}
              <div className="flex items-center gap-3 mb-4 text-[10px] font-bold tracking-wider">
                <div className="bg-[#0B2E26] text-[#10B981] px-2.5 py-1 rounded-sm flex items-center gap-1 border border-[#10B981]/20">
                  <CheckCircle size={10} />
                  DEPT VERIFIED
                </div>
                <div className="text-[#8B92A5]">• 3 MINS AGO</div>
              </div>

              <h2 className="text-2xl font-extrabold text-white leading-tight mb-3">
                {formData.title || "Advanced Quantum Mechanics Seminar Rescheduled"}
              </h2>

              <p className="text-[#8B92A5] text-sm leading-relaxed mb-6 font-medium">
                {formData.description || "Synthesize the core message for the AI engine. This will be the main body text students see on their mobile dashboard."}
              </p>

              {/* Data Blocks */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-4">
                  <div className="text-[10px] font-bold text-[#8B92A5] mb-1 tracking-wider uppercase">Impact Level</div>
                  <div className="text-[#10B981] font-bold text-sm">High Relevance</div>
                </div>
                <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-4">
                  <div className="text-[10px] font-bold text-[#8B92A5] mb-1 tracking-wider uppercase">Sentiment</div>
                  <div className="flex text-[#10B981] gap-1">
                    {'★★★★'.split('').map((s,i) => <span key={i}>{s}</span>)}
                    <span className="text-[#4A5060]">★</span>
                  </div>
                </div>
              </div>

              {/* Presenters / Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#12141A] bg-blue-500 flex items-center justify-center text-[10px] font-bold">AJ</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#12141A] bg-purple-500 flex items-center justify-center text-[10px] font-bold">MK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#12141A] bg-[#2A2E39] text-[#8B92A5] flex items-center justify-center text-[10px] font-bold">+42</div>
                </div>
                <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">
                  View Details
                </button>
              </div>
            </div>
            
          </div>

          {/* Bottom stats below preview */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
            <div className="bg-[#12141A] border border-[#2A2E39] rounded-xl p-4 flex items-center gap-4">
              <div>
                <div className="text-[#10B981] text-[10px] font-bold uppercase tracking-widest mb-1">Network Reach</div>
                <div className="text-white text-xl font-bold">1,240 <span className="text-xs text-[#4A5060] font-normal">Nodes</span></div>
              </div>
            </div>
            <div className="bg-[#12141A] border border-[#2A2E39] rounded-xl p-4 flex items-center gap-4">
              <div>
                <div className="text-[#3B82F6] text-[10px] font-bold uppercase tracking-widest mb-1">Est. Visibility</div>
                <div className="text-white text-xl font-bold">High <span className="text-xs text-[#4A5060] font-normal">Priority</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
