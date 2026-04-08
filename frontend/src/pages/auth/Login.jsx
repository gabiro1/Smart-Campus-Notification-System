import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login: startSession } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // =========================
  // 🔍 VALIDATION
  // =========================
  const validate = () => {
    if (!formData.email.includes("@")) {
      return "Enter a valid email address";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleChange = (e) => {
    setErrorMsg(""); // clear errors on input
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =========================
  // 🚀 SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = await authService.login(
        formData.email,
        formData.password
      );

      if (!data?.success || !data?.user || !data?.token) {
        throw new Error("Invalid server response");
      }

      toast.success(`Welcome back, ${data.user.name}!`);

      startSession(data.user, data.token);
    } catch (error) {
      const message =
        error.message ||
        error.response?.data?.message ||
        "Login failed. Try again.";

      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col relative overflow-hidden">
      <Toaster />
      <Navbar />

      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -top-40 -left-20"
        />
      </div>

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-xl p-10 rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold">Welcome back</h2>
            <p className="text-neutral-500 mt-2">Login to UniNotify AI</p>
          </div>

          {/*  INLINE ERROR */}
          {errorMsg && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                name="email"
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="Institutional email"
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-12 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* LINKS */}
            <div className="flex justify-between text-sm">
              <Link to="/forgot-password" className="text-blue-400 hover:underline">
                Forgot password?
              </Link>
              <Link to="/verify-email/resend" className="text-neutral-400 hover:text-white">
                Verify email?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight />
                </>
              )}
            </button>

            <p className="text-center text-neutral-500 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}