import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Sparkles, Bell, Zap, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const FEATURES = [
  { icon: Bell, text: "Instant campus alerts" },
  { icon: Zap, text: "AI-powered prioritization" },
  { icon: ShieldCheck, text: "Verified sources only" },
];

export default function Login() {
  const { login: startSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
    setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      const data = await authService.login(formData.email, formData.password);

      if (!data?.success || !data?.user || !data?.token) {
        throw new Error("Invalid server response");
      }

      // Only show welcome toast once per session (not on page refresh)
      if (!sessionStorage.getItem("justLoggedIn")) {
        toast.success(`Welcome back, ${data.user.name}!`);
        sessionStorage.setItem("justLoggedIn", "true");
      }
      
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
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <Toaster />
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Hero */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-32 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full">
                <Sparkles className="text-blue-500" size={16} />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
                  Welcome Back
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                Stay
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Connected.
                </span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Access your personalized notification feed. Get instant alerts 
                from verified campus sources, powered by AI that learns your needs.
              </p>

              <div className="space-y-4">
                {FEATURES.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <feature.icon className="text-blue-500" size={20} />
                    </div>
                    <span className="text-foreground font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { value: "12K+", label: "Users" },
                  { value: "850K+", label: "Alerts" },
                  { value: "99.9%", label: "Uptime" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-black text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Scroll Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center pt-4"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-6 h-10 rounded-xl border-2 border-border flex items-start justify-center p-2"
                >
                  <motion.div className="w-1.5 h-3 rounded-full bg-blue-500" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border rounded-[32px] p-8 md:p-10 relative overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome back
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Login to UniNotify AI
                </p>

                {errorMsg && (
                  <div className="mb-6 text-sm text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      name="email"
                      type="email"
                      required
                      disabled={loading}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Institutional email"
                      className="w-full bg-background border border-border p-4 pl-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/50 disabled:opacity-60"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full bg-background border border-border p-4 pl-12 pr-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/50 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex justify-between text-sm">
                    <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400 hover:underline">
                      Forgot password?
                    </Link>
                    <Link to="/verify-email/resend" className="text-muted-foreground hover:text-foreground transition-colors">
                      Verify email?
                    </Link>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-600"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Sign in
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:text-blue-400 hover:underline">
                      Create one
                    </Link>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
