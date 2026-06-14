import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
  Bell,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";
import apiClient from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";

const BENEFITS = [
  { icon: Bell, text: "Instant campus alerts" },
  { icon: Zap, text: "AI-powered prioritization" },
  { icon: ShieldCheck, text: "Verified sources only" },
];

export default function Register() {
  const navigate = useNavigate();
  const { login: startSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push("Full Name is required");
    if (!formData.email.includes("@")) errors.push("Invalid email address");
    if (formData.password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password))
      errors.push("Password must contain uppercase, lowercase, number, and special character (@$!%*?&)");
    if (formData.password !== formData.confirmPassword)
      errors.push("Passwords do not match");
    if (!/^(\+[\d]{7,15})$|^(0[\d]{9,10})$/.test(formData.phoneNumber))
      errors.push("Enter a valid phone number (e.g., 0788123456 or +250788123456)");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg([]);

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrorMsg(validationErrors);
      validationErrors.forEach((err) => toast.error(err));
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post("/users/register", formData);

      toast.success(
        "Account created! Redirecting to verification...",
        {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#171717",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          },
        }
      );

      // Redirect to OTP verification page
      setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(data.email || formData.email)}`), 1500);
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setErrorMsg([serverMsg]);
      toast.error(serverMsg, {
        duration: 4000,
        style: { background: "#171717", color: "#ff4b4b" },
      });
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
                  Join UniNotify AI
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                Start Your
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Journey.
                </span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Create your account and get AI-curated alerts for what matters.
              </p>

              <div className="space-y-4">
                {BENEFITS.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <benefit.icon className="text-blue-500" size={20} />
                    </div>
                    <span className="text-foreground font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { value: "5k+", label: "Users" },
                  { value: "50k+", label: "Alerts" },
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
                  Create your profile
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Join the next generation of academic communication.
                </p>

                {errorMsg.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 space-y-1">
                    {errorMsg.map((err, i) => (
                      <p key={i} className="text-red-400 text-sm">{err}</p>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <InputGroup
                    icon={<User size={18} />}
                    name="name"
                    placeholder="Full Name"
                    type="text"
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <InputGroup
                    icon={<Mail size={18} />}
                    name="email"
                    placeholder="Email"
                    type="email"
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <InputGroup
                    icon={<Phone size={18} />}
                    name="phoneNumber"
                    placeholder="Phone (e.g., 0788123456 or +250788123456)"
                    type="tel"
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <div className="relative">
                    <InputGroup
                      icon={<Lock size={18} />}
                      name="password"
                      placeholder="Create Password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <InputGroup
                    icon={<Lock size={18} />}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <input type="hidden" name="role" value="student" />

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-600"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Hidden for now as per request */}
                  {false && (
                    <>
                      <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { auth, GoogleAuthProvider, signInWithPopup } = await import("../../../firebase");
                            const provider = new GoogleAuthProvider();
                            const result = await signInWithPopup(auth, provider);
                            const idToken = await result.user.getIdToken();
                            
                            const data = await apiClient.post("/users/auth/google", {
                              credential: idToken,
                            });
                            if (data.data?.success) {
                              toast.success(`Welcome, ${data.data.user.name}!`);
                              startSession(data.data.user, data.data.token);
                            }
                          } catch (error) {
                            toast.error(error.response?.data?.message || "Google sign up failed");
                          }
                        }}
                        className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl border border-border bg-background hover:bg-accent transition-all font-medium text-foreground"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.93 3.27-4.77 3.27-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.64l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                      </button>
                    </>
                  )}

                  <p className="text-center text-muted-foreground text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-500 hover:text-blue-400 hover:underline"
                    >
                      Log in
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

function InputGroup({ icon, name, placeholder, type, onChange, disabled }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input
        required
        name={name}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-background border border-border p-4 pl-12 rounded-xl text-foreground outline-none focus:border-blue-500 transition-all placeholder:text-muted-foreground/50 disabled:opacity-60"
      />
    </div>
  );
}


