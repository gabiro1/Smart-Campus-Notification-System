import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import apiClient from "../../services/apiClient";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post("/users/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset link. Try again.";
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

          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-muted-foreground mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
              <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
              <p className="text-muted-foreground text-sm">
                We sent a password reset link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                <br />
                It expires in 30 minutes.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-blue-400 hover:text-blue-300 text-sm"
              >
                Didn't receive it? Try again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-accent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground placeholder:text-muted-foreground"
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
                  "Send Reset Link"
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
