/**
 * @page Features
 * @description A high-fidelity showcase of the UniNotify AI tech stack.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Smartphone,
  BarChart3,
} from "lucide-react";
import Navbar from "@/layouts/Navbar";
import Footer from "@/layouts/Footer";

const FEATURE_DATA = [
  {
    title: "AI-Ranked Feed",
    icon: <Cpu size={24} />,
    desc: "Our neural engine filters academic noise, ensuring critical departmental alerts appear first based on your module enrollment.",
  },
  {
    title: "SMS Fallback",
    icon: <Zap size={24} />,
    desc: "Proprietary offline routing triggers SMS alerts when data connectivity is lost, ensuring zero information decay.",
  },
  {
    title: "Verified Identity",
    icon: <ShieldCheck size={24} />,
    desc: "Zero-trust communication. Every post is verified against staff IDs to eliminate campus misinformation.",
  },
  {
    title: "Bento Interface",
    icon: <LayoutGrid size={24} />,
    desc: "High-density information design optimized for quick scanning and 100% readability on all devices.",
  },
  {
    title: "PWA Support",
    icon: <Smartphone size={24} />,
    desc: "Install UniNotify on any device. It stays pinned to your home screen and works seamlessly on low-bandwidth networks.",
  },
  {
    title: "Live Delivery",
    icon: <BarChart3 size={24} />,
    desc: "Lecturers receive instant analytics on who has read messages and who received the SMS fallback.",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-20 px-6 relative overflow-hidden ">
      <Navbar />
      {/* Background Large Typography */}
      <h1 className="text-[20vw] font-black text-white/[0.02] absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        CORE
      </h1>

      <div className="max-w-6xl mx-auto relative z-10 tracking-tighter text-center mb-20">
        {/* Header */}
        <div className="mb-35 text-center">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-black text-white text-center leading-relaxed tracking-tighter  mb-4"
          >
            Engineered for <span className="text-neutral-600">Impact.</span>
          </motion.h2>
          <p className="text-neutral-300 max-w-xl text-lg font-medium text-center mx-auto tracking-normal">
            Technical solutions for real-world campus communication challenges.
            Built for the University of Rwanda ecosystem.
          </p>
        </div>

        {/* Features Bento-ish Grid */}
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURE_DATA.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, borderColor: "rgba(37, 99, 235, 0.3)" }}
              className="glass p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent hover:bg-white/[0.04] transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6  group-hover:text-white transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3  tracking-tight">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            to="/register"
            className="glass p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent hover:bg-white/[0.04] transition-all group  text-white inline-block  px-12 py-5 rounded-2xl  tracking-widest shadow-lg   transition-all"
          >
            Experience the Pulse
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
