import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import apiClient from "../../services/apiClient";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-card text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-4">This reset link is invalid or missing.</p>
            <Link to="/forgot-password" className="text-blue-500 hover:underline">Request a new password reset</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);

    try {
      await apiClient.put(`/users/reset-password/${token}`, {
        password: formData.password,
      });
      setSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const message =
        error.response?.data?.message || "Reset failed. Link may have expired.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card text-foreground flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground mb-8">
            Enter your new password below.
          </p>

          {success ? (
            <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
              <h2 className="text-xl font-semibold mb-2">Password Updated!</h2>
              <p className="text-muted-foreground text-sm">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New password"
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder-neutral-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder-neutral-500"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
