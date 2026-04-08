import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Landmark,
  GraduationCap,
  Target,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login: startSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    school: "",
    department: "",
    level: "",
    role: "student",
  });

  const [dropdowns, setDropdowns] = useState({
    schools: [],
    departments: [],
    levels: [],
    loading: true,
    error: null,
  });

  // --- Fetch dropdown data dynamically ---
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [schoolsRes, departmentsRes, levelsRes] = await Promise.all([
          apiClient.get("/dropdowns/schools"),
          apiClient.get("/dropdowns/departments"),
          apiClient.get("/dropdowns/levels"),
        ]);
        setDropdowns({
          schools: schoolsRes.data || [],
          departments: departmentsRes.data || [],
          levels: levelsRes.data || [],
          loading: false,
          error: null,
        });
        // Set defaults
        setFormData((prev) => ({
          ...prev,
          school: schoolsRes.data[0]?.name || "",
          department: departmentsRes.data[0]?.name || "",
          level: levelsRes.data[0]?.name || "",
        }));
      } catch (err) {
        setDropdowns((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load dropdowns. Please refresh.",
        }));
      }
    };

    fetchDropdowns();
  }, []);

  // --- Input change handler ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Validation ---
  const validate = () => {
    if (!formData.name.trim()) return "Full Name is required";
    if (!formData.email.includes("@")) return "Invalid email address";
    if (formData.password.length < 8)
      return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (!/^07\d{8}$/.test(formData.phoneNumber))
      return "Phone number must be valid (Rwanda format)";
    if (!formData.school || !formData.department || !formData.level)
      return "Please select school, department, and level";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const validationError = validate();
    if (validationError) return toast.error(validationError);

    setLoading(true);
    try {
      const { data } = await apiClient.post("/users/register", formData);

      toast.success(
        "Account created successfully! Please verify your email.",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#171717",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          },
        }
      );

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setErrorMsg(serverMsg);
      toast.error(serverMsg, {
        duration: 4000,
        style: { background: "#171717", color: "#ff4b4b" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col relative overflow-hidden">
      <Toaster />
      <Navbar />

      {/* Lava lamp background */}
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 md:p-12 rounded-[40px] border border-white/10 w-full max-w-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
              Create your profile
            </h2>
            <p className="text-neutral-500 font-medium italic">
              Join the next generation of academic communication.
            </p>
          </div>

          {errorMsg && (
            <div className="text-red-400 bg-red-500/10 p-3 rounded-xl mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <InputGroup
                icon={<User size={18} />}
                name="name"
                placeholder="Full Name"
                type="text"
                onChange={handleChange}
                disabled={loading}
              />
            </div>

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
              placeholder="Phone (e.g. 078...)"
              type="tel"
              onChange={handleChange}
              disabled={loading}
            />

            <div className="md:col-span-2 relative">
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="md:col-span-2">
              <InputGroup
                icon={<Lock size={18} />}
                name="confirmPassword"
                placeholder="Confirm Password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* --- Dynamic dropdowns --- */}
            {dropdowns.loading ? (
              <div className="md:col-span-2 text-center text-neutral-500">
                Loading schools & departments...
              </div>
            ) : dropdowns.error ? (
              <div className="md:col-span-2 text-center text-red-400">
                {dropdowns.error}
              </div>
            ) : (
              <>
                <SelectGroup
                  icon={<Landmark size={18} />}
                  name="school"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {dropdowns.schools.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </SelectGroup>

                <SelectGroup
                  icon={<Target size={18} />}
                  name="department"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {dropdowns.departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </SelectGroup>

                <SelectGroup
                  icon={<GraduationCap size={18} />}
                  name="level"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {dropdowns.levels.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </SelectGroup>
              </>
            )}

            <input type="hidden" name="role" value="student" />

            <div className="md:col-span-2 pt-6">
              <button
                disabled={loading || dropdowns.loading}
                type="submit"
                className="w-full bg-white py-5 rounded-2xl text-black font-bold shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:bg-neutral-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Create Account{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>

              <p className="text-center mt-6 text-neutral-500 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-500/60 hover:text-blue-400 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---
function InputGroup({ icon, name, placeholder, type, onChange, disabled }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input
        required
        name={name}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-neutral-600 disabled:opacity-60"
      />
    </div>
  );
}

function SelectGroup({ icon, name, children, onChange, disabled }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors z-10">
        {icon}
      </div>
      <select
        name={name}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer bg-neutral-900 disabled:opacity-60"
      >
        {children}
      </select>
    </div>
  );
}