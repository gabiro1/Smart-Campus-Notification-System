import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // navigate is now handled by Context!
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- CUSTOM IMPORTS ---
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import authService from "../../services/authService"; // The Muscle
import { useAuth } from "../../context/AuthContext"; // The Brain

export default function Login() {
  const { login: startSession } = useAuth(); // Destructure login as startSession to avoid name conflict
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. USE THE SERVICE (The Muscle)
      // This keeps our component clean of Axios logic
      const data = await authService.login(formData.email, formData.password);

      if (data.success) {
        toast.success(`Welcome back, ${data.user.name}!`);

        // 2. USE THE CONTEXT (The Brain)
        // This handles localStorage AND redirects based on role automatically
        startSession(data.user, data.token);
      }
    } catch (error) {
      // authService already formats the error message for us!
      toast.error(error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      <Toaster />
      <Navbar />

      {/* --- LAVA LAMP BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -top-40 -left-20"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full -bottom-20 -right-20"
        />
      </div>

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-xl p-10 rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-neutral-500 font-medium mt-2">
              Login to UniNotify AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                required
                name="email"
                type="email"
                placeholder="Institutional email"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                required
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                size="sm"
                className="text-sm text-blue-500/60 hover:text-blue-400"
              >
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl text-white font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign in{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            <p className="text-center text-neutral-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500/60 hover:text-blue-400 hover:underline"
              >
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
