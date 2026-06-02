import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, BookOpen, Code, Flame, Trophy, Music, Palette, Globe, Zap, Rocket, PartyPopper } from "lucide-react";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";

const INTERESTS = [
  { id: "academics", label: "Academics", icon: BookOpen, color: "blue" },
  { id: "technology", label: "Technology", icon: Code, color: "purple" },
  { id: "sports", label: "Sports", icon: Trophy, color: "orange" },
  { id: "events", label: "Events", icon: Sparkles, color: "pink" },
  { id: "music", label: "Music", icon: Music, color: "green" },
  { id: "arts", label: "Arts", icon: Palette, color: "yellow" },
  { id: "international", label: "International", icon: Globe, color: "cyan" },
  { id: "career", label: "Career", icon: Zap, color: "indigo" },
];

export default function InterestSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: startSession } = useAuth();
  const userId = searchParams.get("userId");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId));
    } else {
      if (selectedInterests.length >= 3) {
        toast.error("You can select up to 3 interests");
        return;
      }
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setLoading(true);
    try {
      // const { data } = await apiClient.post("/users/complete-onboarding", {
      const { data } = await apiClient.put("/users/onboarding", {
        userId,
        interests: selectedInterests,
      });

      toast.success("Profile setup complete! Redirecting...");
      
      // Show advanced loader then auto-login
      setShowLoader(true);
      setLoading(false);
      
      // Auto-login with the token from response
      if (data.token && data.user) {
        setTimeout(() => {
          startSession(data.user, data.token);
          // Navigation will be handled by AuthContext based on user role
        }, 2000);
      } else {
        // Fallback to login page if no token
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save interests");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-blue-500" size={28} />
              </div>
              <h1 className="text-2xl font-bold mb-2">Select Your Interests</h1>
              <p className="text-muted-foreground">
                Choose up to <span className="text-foreground font-medium">3 interests</span> to personalize your notifications
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {INTERESTS.map((interest, index) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <motion.button
                    key={interest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `border-${interest.color}-500 bg-${interest.color}-500/10`
                        : "border-border hover:border-muted bg-background"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <interest.icon
                        size={28}
                        className={isSelected ? `text-${interest.color}-500` : "text-muted-foreground"}
                      />
                      <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {interest.label}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-4">
                {selectedInterests.length}/3 interests selected
              </p>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedInterests.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Complete Setup
                    <Check size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
