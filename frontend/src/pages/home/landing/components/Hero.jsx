import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import styles from "./Styles.module.css";

export default function Hero({ user }) {
  // 2. Assuming 'user' is passed as a prop
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    // 3. Logic: If and only if user.role is 'admin', navigate to admin dashboard
    if (user?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      // 4. Otherwise, navigate to their respective student/lecturer dashboard
      // If no user is logged in, you might want to redirect to /login
      const targetPath = user?.role ? `/${user.role}/dashboard` : "/login";
      navigate(targetPath);
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-6 bg-[#050505] flex flex-col items-center text-center">
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl"
      >
        <span className="px-3 py-1 font-sans rounded-full border border-white/10 text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 inline-block bg-white/5">
          AI-Powered Communication for UR
        </span>

        <h1
          className={`${styles.heading} text-6xl md:text-7xl font-semibold text-white font-black tracking-tight mb-6 leading-none`}
        >
          Smart Alerts. <br />
          <span className="text-neutral-600">Zero Noise.</span>
        </h1>

        <p className="text-neutral-500 max-w-lg mx-auto text-base mb-10 leading-relaxed">
          The ultimate bridge between University administration and students.
          Get the news you need, exactly when you need it.
        </p>

        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-lg font-bold text-sm transition-all">
            Join the Beta
          </button>
          <button
            onClick={handleAdminAccess} // 5. Added click handler
            className="px-6 py-3 bg-[#111111] border border-white/10 text-white hover:bg-white/5 rounded-lg font-bold text-sm transition-all"
          >
            Admin Portal
          </button>
        </div>
      </motion.div>
    </section>
  );
}
