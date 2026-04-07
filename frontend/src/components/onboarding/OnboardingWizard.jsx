import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check, Bell, Mail, MessageSquare, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

// Available interest topics (customize as needed)
const INTEREST_OPTIONS = [
  "Technology",
  "Sports",
  "Seminars",
  "Workshops",
  "Arts & Culture",
  "Academic",
  "Career",
  "Networking",
  "Health & Wellness",
  "Volunteer",
  "Leadership",
  "Innovation",
  "Research",
  "Entertainment",
];

export default function OnboardingWizard() {
  const { user, updateUser } = useAuth();

  // State for each step
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [channelPrefs, setChannelPrefs] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [quietHours, setQuietHours] = useState({
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load existing user data if reopened
  useEffect(() => {
    if (user) {
      if (user.interests && Array.isArray(user.interests)) {
        setSelectedInterests(user.interests);
      }
      if (user.notificationPreferences) {
        setChannelPrefs({
          push: user.notificationPreferences.push ?? true,
          email: user.notificationPreferences.email ?? true,
          sms: user.notificationPreferences.sms ?? false,
        });
      }
      if (user.quietHours) {
        setQuietHours({
          startTime: user.quietHours.startTime || "",
          endTime: user.quietHours.endTime || "",
        });
      }
    }
  }, [user]);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await userService.completeOnboarding({
        interests: selectedInterests,
        channelPreferences: channelPrefs,
        quietHours: quietHours.startTime && quietHours.endTime ? quietHours : undefined,
      });

      if (result.success) {
        // Update local auth context with new user data
        updateUser({
          ...user,
          hasCompletedOnboarding: true,
          interests: selectedInterests,
          notificationPreferences: result.user?.notificationPreferences || channelPrefs,
          quietHours: quietHours.startTime && quietHours.endTime ? quietHours : null,
        });
        toast.success("Onboarding complete!");
      } else {
        throw new Error(result.message || "Failed to save preferences");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // If user already completed onboarding, render nothing
  if (user?.hasCompletedOnboarding) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <div>
              <h2 className="text-xl font-bold text-white">Welcome, {user?.name?.split(" ")[0] || "Student"}!</h2>
              <p className="text-sm text-neutral-400 mt-1">Let's personalize your notification experience</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Step {step} of 3
              </span>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 py-4 bg-[#050505]">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step >= s ? "bg-blue-500" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="p-8 min-h-[320px]">
            {/* Step 1: Interests */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Select Your Interests</h3>
                    <p className="text-sm text-neutral-500">Choose topics that matter to you. We'll use this to personalize announcements.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedInterests.includes(interest)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-background border-white/10 text-neutral-400 hover:border-white/30"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Channel Preferences */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Bell size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Notification Channels</h3>
                    <p className="text-sm text-neutral-500">Choose how you want to receive alerts.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "push", label: "Push Notifications", icon: Bell, desc: "In-app & mobile alerts" },
                    { key: "email", label: "Email", icon: Mail, desc: "Digest & important alerts" },
                    { key: "sms", label: "SMS", icon: MessageSquare, desc: "Urgent text messages" },
                  ].map(({ key, label, icon: Icon, desc }) => (
                    <div
                      key={key}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        channelPrefs[key]
                          ? "bg-purple-500/10 border-purple-500/30"
                          : "bg-background border-white/10 opacity-60"
                      }`}
                      onClick={() => setChannelPrefs((p) => ({ ...p, [key]: !p[key] }))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={18} className={channelPrefs[key] ? "text-purple-400" : "text-neutral-500"} />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            channelPrefs[key]
                              ? "bg-purple-500 border-purple-500"
                              : "border-neutral-500"
                          }`}
                        >
                          {channelPrefs[key] && <Check size={10} className="text-white" />}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white">{label}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Quiet Hours */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Moon size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Quiet Hours</h3>
                    <p className="text-sm text-neutral-500">Set a time when you don't want to be disturbed (except urgent alerts).</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Start Time (24h)
                    </label>
                    <input
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) => setQuietHours((qh) => ({ ...qh, startTime: e.target.value }))}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      End Time (24h)
                    </label>
                    <input
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) => setQuietHours((qh) => ({ ...qh, endTime: e.target.value }))}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-500">
                  Non-urgent notifications (low/medium priority) will be delayed outside these hours. You'll still see them in the app.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#050505]">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && selectedInterests.length === 0) ||
                  (step === 2 && !channelPrefs.push && !channelPrefs.email && !channelPrefs.sms)
                }
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
