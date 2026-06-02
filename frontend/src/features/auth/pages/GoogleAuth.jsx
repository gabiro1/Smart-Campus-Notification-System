import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";

export default function GoogleAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: startSession } = useAuth();
  const [status, setStatus] = useState("processing"); // processing | success | error | needs-setup
  const [userData, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const credential = searchParams.get("credential");
      
      if (!credential) {
        setStatus("error");
        return;
      }

      try {
        const { data } = await apiClient.post("/users/auth/google", {
          credential,
          role: "student"
        });

        if (data.success) {
          // Check if this is a new user who needs onboarding
          if (data.isNewUser || !data.user?.hasCompletedOnboarding) {
            setUser(data);
            setIsNewUser(true);
            setStatus("needs-setup");
          } else {
            // Existing user - log them in directly
            startSession(data.user, data.token);
            setStatus("success");
            setTimeout(() => navigate(`/${data.user.role}/dashboard`), 2000);
          }
        }
      } catch (error) {
        console.error("Google Auth Error:", error);
        setStatus("error");
        toast.error(error.response?.data?.message || "Google authentication failed");
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, startSession]);

  const handleGoToSetup = () => {
    if (userData?.user && userData?.token) {
      startSession(userData.user, userData.token);
      navigate("/interest-selection");
    }
  };

  const handleSkipSetup = () => {
    if (userData?.user && userData?.token) {
      startSession(userData.user, userData.token);
      navigate(`/${userData.user.role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          {status === "processing" && (
            <div className="space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full mx-auto">
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Authenticating with Google...</h1>
              <p className="text-muted-foreground">Please wait while we verify your account</p>
            </div>
          )}

          {status === "success" && (
            <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="mx-auto mb-4 text-green-400" size={56} />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-muted-foreground mb-4">You're being redirected to your dashboard...</p>
              <div className="flex items-center justify-center gap-2 text-blue-500">
                <Sparkles size={16} />
                <span className="text-sm">Setting up your experience</span>
              </div>
            </div>
          )}

          {status === "needs-setup" && (
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-blue-500" size={28} />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to UniNotify AI!</h1>
              <p className="text-muted-foreground mb-8">
                This is your first time signing in with Google. Would you like to personalize your experience?
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleGoToSetup}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Setup My Interests
                </button>
                
                <button
                  onClick={handleSkipSetup}
                  className="w-full bg-background border border-border hover:bg-accent py-4 rounded-xl font-medium transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-8">
              <XCircle className="mx-auto mb-4 text-red-400" size={56} />
              <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
              <p className="text-muted-foreground mb-6">We couldn't verify your Google account. Please try again.</p>
              <button
                onClick={() => navigate("/login")}
                className="inline-block bg-accent hover:bg-accent/80 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
