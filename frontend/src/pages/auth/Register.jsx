import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Landmark,
  GraduationCap,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // Import toast
import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import apiClient from "../../services/apiClient";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    school: "School of ICT",
    department: "Information Technology",
    level: "Year 4",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await apiClient.post("/users/register", formData);

      // 1. Show Success Toast
      toast.success("Account created successfully!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#171717",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        },
      });

      // 2. Handle Auth Storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // 3. Delayed Navigation to let the toast be seen
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMsg, {
        duration: 4000,
        style: {
          background: "#171717",
          color: "#ff4b4b",
          border: "1px solid rgba(255,75,75,0.2)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      {/* Toast Provider */}
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
              />
            </div>

            <InputGroup
              icon={<Mail size={18} />}
              name="email"
              placeholder="Email"
              type="email"
              onChange={handleChange}
            />
            <InputGroup
              icon={<Phone size={18} />}
              name="phoneNumber"
              placeholder="Phone (e.g. 078...)"
              type="tel"
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <InputGroup
                icon={<Lock size={18} />}
                name="password"
                placeholder="Create Password"
                type="password"
                onChange={handleChange}
              />
            </div>

            <SelectGroup
              icon={<Landmark size={18} />}
              name="school"
              onChange={handleChange}
            >
              <option value="School of ICT">School of ICT</option>
              <option value="School of Engineering">
                School of Engineering
              </option>
              <option value="School of Business">School of Business</option>
            </SelectGroup>

            <SelectGroup
              icon={<Target size={18} />}
              name="department"
              onChange={handleChange}
            >
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Computer Science">Computer Science</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </SelectGroup>

            <SelectGroup
              icon={<GraduationCap size={18} />}
              name="level"
              onChange={handleChange}
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </SelectGroup>

            <input type="hidden" name="role" value="student" />

            <div className="md:col-span-2 pt-6">
              <button
                disabled={loading}
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
function InputGroup({ icon, name, placeholder, type, onChange }) {
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
        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-neutral-600"
      />
    </div>
  );
}

function SelectGroup({ icon, name, children, onChange }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors z-10">
        {icon}
      </div>
      <select
        name={name}
        onChange={onChange}
        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer bg-neutral-900"
      >
        {children}
      </select>
    </div>
  );
}
