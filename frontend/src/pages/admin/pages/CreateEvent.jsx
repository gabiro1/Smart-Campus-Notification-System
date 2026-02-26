import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Send } from "lucide-react";

export default function CreateEvent() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = (e) => {
    e.preventDefault();
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    alert("Smart Alert Dispatched via AI Engine!");
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="w-full  bg-[#0D0D0D] border border-white/5 rounded-[10px] p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10" />

          {/* Header Section */}
          <div className="flex justify-between items-start mb-12">
            <div>
              
              <h1 className="text-4xl font-black tracking-tighter">
                {step === 3 ? "Finalize Alert" : "Create Smart Alert"}
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                {step === 1 &&
                  "Target specific student segments using AI metadata."}
                {step === 2 && "Define the core content and urgency level."}
                {step === 3 && "Review metadata rankings before broadcasting."}
              </p>
            </div>
            <div className="px-4 py-2 bg-[#1A1A1A] text-white rounded-2xl border border-white/5 text-[11px] font-bold">
              Step {step} of {totalSteps}
            </div>
          </div>

          <form onSubmit={nextStep} className="space-y-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: AUDIENCE */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">
                      1
                    </div>
                    Define Target Audience
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormSelect
                      label="College"
                      options={["Science & Tech", "Engineering", "Business"]}
                    />
                    <FormSelect
                      label="School"
                      options={["School of ICT", "School of Mining"]}
                    />
                    <FormSelect
                      label="Department"
                      options={["IT", "Computer Science", "Software Eng"]}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CONTENT */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">
                      2
                    </div>
                    Message Content
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-neutral-500 ml-1">
                        Alert Title
                      </label>
                      <input
                        className="w-full bg-[#141414] border border-white/5 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Huawei Placement Test"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-neutral-500 ml-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        className="w-full bg-[#141414] border border-white/5 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all resize-none"
                        placeholder="Provide event details..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: METADATA & SUBMIT */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs">
                      3
                    </div>
                    AI Metadata Tags
                  </h3>
                  <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                    <p className="text-[11px] text-neutral-400 leading-relaxed mb-4">
                      These tags help the AI Engine rank this event for
                      interested students based on their profile engagement
                      history.
                    </p>
                    <input
                      className="w-full bg-[#141414] border border-white/5 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="e.g. #Cybersecurity, #Huawei, #Placement"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 bg-[#1A1A1A] text-neutral-400 p-4 rounded-2xl font-bold hover:text-white border border-white/5 transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 p-4 w-[120px] rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                  step === totalSteps
                    ? "bg-blue-600 text-white shadow-blue-600/20"
                    : "bg-white text-black"
                }`}
              >
                {step === totalSteps ? (
                  <>
                    Submit Dispatch <Send size={16} />
                  </>
                ) : (
                  <>
                    Next <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Helper Component for inputs
function FormSelect({ label, options }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase text-neutral-500 ml-1">
        {label}
      </label>
      <select className="w-full bg-[#141414] border border-white/5 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer text-sm">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
