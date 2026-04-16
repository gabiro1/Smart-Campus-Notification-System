/**
 * @page Features
 * @description Advanced showcase of UniNotify AI features.
 */
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Cpu,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Smartphone,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Bell,
  Users,
  Globe,
  Clock,
} from "lucide-react";
import Navbar from "@/layouts/Navbar";
import Footer from "@/layouts/Footer";

const CORE_FEATURES = [
  {
    icon: Cpu,
    title: "AI-Ranked Feed",
    desc: "Neural engine filters academic noise, prioritizing critical departmental alerts based on your module enrollment.",
    color: "blue",
  },
  {
    icon: Zap,
    title: "SMS Fallback",
    desc: "Offline routing triggers SMS alerts when connectivity is lost, ensuring zero information decay.",
    color: "yellow",
  },
  {
    icon: ShieldCheck,
    title: "Verified Identity",
    desc: "Zero-trust communication. Every post verified against staff IDs to eliminate misinformation.",
    color: "emerald",
  },
  {
    icon: LayoutGrid,
    title: "Bento Interface",
    desc: "High-density design optimized for quick scanning and 100% readability on all devices.",
    color: "purple",
  },
  {
    icon: Smartphone,
    title: "PWA Support",
    desc: "Install UniNotify on any device. Works seamlessly on low-bandwidth networks.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Instant insights on message delivery, read status, and SMS fallback performance.",
    color: "pink",
  },
];

const STATS = [
  { icon: Users, value: "12K+", label: "Active Users" },
  { icon: Bell, value: "850K+", label: "Alerts Delivered" },
  { icon: Globe, value: "99.9%", label: "Uptime" },
  { icon: Clock, value: "120s", label: "SMS Fallback" },
];

const WHY_CHOOSE = [
  "Real-time AI prioritization",
  "Offline-first architecture",
  "Verified campus sources only",
  "Cross-platform PWA",
  "End-to-end encryption",
  "24/7 availability",
];

const colorMap = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-500" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-500" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-500" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-500" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-500" },
  pink: { bg: "bg-pink-500/20", text: "text-pink-500" },
};

export default function Features() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/5 to-transparent" />
        </div>

        <motion.div
          ref={ref}
          style={{ y }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full mb-8"
          >
            <Sparkles className="text-blue-500" size={16} />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
              Powerful Features
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tight"
          >
            Built for Campus
            <span className="block mt-2 text-blue-500">Communication</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            From AI-powered prioritization to offline SMS fallback, UniNotify AI delivers 
            the most intelligent campus notification system ever built.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-2xl mb-4">
                  <stat.icon className="text-blue-500" size={24} />
                </div>
                <div className="text-3xl md:text-4xl font-black text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Six powerful features designed to transform how your campus communicates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_FEATURES.map((feature, i) => {
              const colors = colorMap[feature.color];
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative bg-card rounded-3xl p-8 border border-border transition-all cursor-default"
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:opacity-80 transition-all`}
                  >
                    <Icon className={colors.text} size={32} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Hover Bottom Line */}
                  <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-blue-500/10 rounded-full mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Why UniNotify AI</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
                The Smartest Choice for
                <span className="block text-blue-500">Campus Communication</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                We built UniNotify AI specifically for university environments, understanding the unique 
                challenges of campus communication and designing solutions that actually work.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {WHY_CHOOSE.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-emerald-500" size={14} />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Feature Highlight Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-[40px] p-8 border border-border"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Cpu className="text-blue-500" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">AI-Powered Engine</h3>
                  <p className="text-sm text-muted-foreground">Intelligent prioritization</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-background rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Priority Score</span>
                    <span className="text-sm font-bold text-blue-500">96%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "96%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="bg-background rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Delivery Rate</span>
                    <span className="text-sm font-bold text-emerald-500">99.9%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "99.9%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="bg-background rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Response Time</span>
                    <span className="text-sm font-bold text-yellow-500">&lt;100ms</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9, duration: 1 }}
                      className="h-full bg-yellow-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative bg-card rounded-[40px] p-10 md:p-16 border border-border overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full mb-6"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Start Today</span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4"
                  >
                    Ready to Experience
                    <span className="block text-blue-500">The Difference?</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground text-lg leading-relaxed mb-8"
                  >
                    Join 12,000+ students and staff who rely on UniNotify AI for smarter, 
                    faster, and more reliable campus communication.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-blue-500" size={18} />
                      <span className="text-sm text-foreground font-medium">Free Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-blue-500" size={18} />
                      <span className="text-sm text-foreground font-medium">No Credit Card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-blue-500" size={18} />
                      <span className="text-sm text-foreground font-medium">2-Min Setup</span>
                    </div>
                  </motion.div>
                </div>

                {/* Right - Action */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center lg:text-right"
                >
                  <div className="inline-block">
                    <Link
                      to="/register"
                      className="group inline-flex items-center gap-3 bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
                    >
                      Get Started Free
                      <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <p className="mt-6 text-sm text-muted-foreground">
                    No account required to start
                  </p>

                  <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">Already have an account?</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-blue-500 font-medium hover:underline"
                    >
                      Sign in to your account
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
