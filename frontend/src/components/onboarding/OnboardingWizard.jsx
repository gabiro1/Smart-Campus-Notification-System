import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Bell, Mail, MessageSquare, Moon, Monitor, Zap, Trophy, GraduationCap, Palette, BookOpen, Briefcase, Users, Heart, Globe, Crown, Lightbulb, FlaskConical, Music } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

const INTEREST_OPTIONS = [
  { label: "Technology", icon: Monitor },
  { label: "Sports", icon: Trophy },
  { label: "Seminars", icon: GraduationCap },
  { label: "Workshops", icon: Zap },
  { label: "Arts & Culture", icon: Palette },
  { label: "Academic", icon: BookOpen },
  { label: "Career", icon: Briefcase },
  { label: "Networking", icon: Users },
  { label: "Health & Wellness", icon: Heart },
  { label: "Volunteer", icon: Globe },
  { label: "Leadership", icon: Crown },
  { label: "Innovation", icon: Lightbulb },
  { label: "Research", icon: FlaskConical },
  { label: "Entertainment", icon: Music },
];

export default function OnboardingWizard() {
  const { user, updateUser } = useAuth();

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

  if (user?.hasCompletedOnboarding) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl"
        >
          <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Welcome, {user?.name?.split(" ")[0] || "Student"}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">Let's personalize your experience</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step >= s ? "bg-neutral-400" : "bg-neutral-800"
                    }`}
                  />
                ))}
                <span className="text-xs text-neutral-600 ml-2 font-medium">
                  {step}/3
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 min-h-[300px]">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1 mb-4">
                  <span className="text-3xl">🎯</span>
                  <h3 className="text-base font-semibold text-neutral-200 mt-2">What interests you?</h3>
                  <p className="text-sm text-neutral-500">Pick topics to personalize your feed</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTEREST_OPTIONS.map(({ label, icon: Icon }) => {
                    const isSelected = selectedInterests.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleInterest(label)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition-all border ${
                          isSelected
                            ? "bg-neutral-800 border-neutral-600 text-neutral-200"
                            : "bg-transparent border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedInterests.length > 0 && (
                  <p className="text-center text-xs text-neutral-500 pt-1">
                    {selectedInterests.length} selected
                  </p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1 mb-4">
                  <span className="text-3xl">🔔</span>
                  <h3 className="text-base font-semibold text-neutral-200 mt-2">Notification channels</h3>
                  <p className="text-sm text-neutral-500">How should we reach you?</p>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "push", label: "Push Notifications", icon: Bell, desc: "In-app alerts" },
                    { key: "email", label: "Email", icon: Mail, desc: "Daily digest" },
                    { key: "sms", label: "SMS", icon: MessageSquare, desc: "Urgent messages only" },
                  ].map(({ key, label, icon: Icon, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChannelPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        channelPrefs[key]
                          ? "bg-neutral-800 border-neutral-600"
                          : "bg-transparent border-neutral-800 opacity-60"
                      }`}
                    >
                      <Icon size={16} className="text-neutral-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-200">{label}</div>
                        <div className="text-xs text-neutral-500">{desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        channelPrefs[key] ? "bg-neutral-500 border-neutral-500" : "border-neutral-700"
                      }`}>
                        {channelPrefs[key] && <Check size={10} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1 mb-4">
                  <span className="text-3xl">🌙</span>
                  <h3 className="text-base font-semibold text-neutral-200 mt-2">Quiet hours</h3>
                  <p className="text-sm text-neutral-500">When should notifications pause?</p>
                </div>
                <div className="bg-neutral-800/50 border border-neutral-800 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Start</label>
                    <input
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) => setQuietHours((qh) => ({ ...qh, startTime: e.target.value }))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 outline-none focus:border-neutral-600 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">End</label>
                    <input
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) => setQuietHours((qh) => ({ ...qh, endTime: e.target.value }))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 outline-none focus:border-neutral-600 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-600 text-center">
                  Low priority alerts will queue during these hours
                </p>
              </motion.div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Skip setup
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && selectedInterests.length === 0) ||
                  (step === 2 && !channelPrefs.push && !channelPrefs.email && !channelPrefs.sms)
                }
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-neutral-200 text-neutral-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-neutral-200 text-neutral-900 hover:bg-white disabled:opacity-30 transition-all"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-3.5 h-3.5 border-2 border-neutral-500 border-t-neutral-900 rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Complete
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
