/**
 * @page HowItWorks
 * @description Advanced animated explanation of UniNotify AI's process.
 */
import Footer from "@/layouts/Footer";
import Navbar from "@/layouts/Navbar";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { Cpu, Send, ShieldCheck, Zap, ArrowRight, CheckCircle2, Sparkles, Play, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    id: "01",
    title: "Official Origin",
    subtitle: "Verified Sources Only",
    icon: ShieldCheck,
    desc: "Every notification originates from verified University Staff, HODs, Deans, or Guild Leaders. Our zero-trust architecture ensures no fake news ever enters the system.",
    details: ["Staff ID verification", "Role-based permissions", "Content approval workflow"],
    color: "blue",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    id: "02",
    title: "Neural Ranking",
    subtitle: "AI-Powered Intelligence",
    icon: Cpu,
    desc: "Our proprietary AI Pulse engine analyzes notification metadata, cross-references with your enrolled modules, department, and level, then calculates an Urgency Score for intelligent prioritization.",
    details: ["Module matching algorithm", "Urgency scoring system", "Personalized ranking"],
    color: "purple",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
  {
    id: "03",
    title: "Hybrid Delivery",
    subtitle: "Always Connected",
    icon: Zap,
    desc: "Smart connectivity detection routes your notification through Push (online) or SMS Gateway (offline). Our heartbeat system triggers SMS fallback within 120 seconds of detecting disconnection.",
    details: ["Real-time connectivity check", "Automatic SMS fallback", "99.9% delivery rate"],
    color: "amber",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    id: "04",
    title: "Student Response",
    subtitle: "Continuous Learning",
    icon: Send,
    desc: "Reactions, ratings, and calendar syncs create a feedback loop that continuously improves the AI model. Your engagement makes the system smarter for everyone.",
    details: ["Engagement tracking", "Calendar integration", "AI model training"],
    color: "emerald",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
];

const colorMap = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/30",
    hover: "hover:bg-blue-500",
    ring: "ring-blue-500/30",
    shadow: "shadow-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/30",
    hover: "hover:bg-purple-500",
    ring: "ring-purple-500/30",
    shadow: "shadow-purple-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
    hover: "hover:bg-amber-500",
    ring: "ring-amber-500/30",
    shadow: "shadow-amber-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
    hover: "hover:bg-emerald-500",
    ring: "ring-emerald-500/30",
    shadow: "shadow-emerald-500/20",
  },
};

export default function HowItWorks() {
  const targetRef = useRef(null);
  useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <HeroSection />

      {/* --- MAIN CONTENT --- */}
      <main ref={targetRef} className="relative z-10">
        {/* Timeline Track */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent hidden lg:block" />

        {/* Steps */}
        <section className="max-w-6xl mx-auto px-6 py-20 space-y-32">
          {STEPS.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} totalSteps={STEPS.length} />
          ))}
        </section>

        {/* --- FEATURES GRID --- */}
        <FeaturesSection />

        {/* --- CTA SECTION --- */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8"
        >
          <Sparkles className="text-primary" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Powered by AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-6"
        >
          The Mechanics
          <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
            of Intelligence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Four seamless steps transform campus communication. From verified origins to 
          AI-powered delivery, experience notifications that adapt to you.
        </motion.p>

        {/* Animated Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-xl border-2 border-border flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-3 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({ step, index, totalSteps: _totalSteps }) {
  const ref = useRef(null);
  const colors = colorMap[step.color];
  const isEven = index % 2 === 0;
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 lg:gap-20 items-center`}
    >
      {/* Timeline Node */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-4 rounded-full bg-background border-2 border-primary hidden lg:block" style={{ top: "50%" }}>
        <div className="absolute inset-1 rounded-full bg-primary animate-ping opacity-50" />
        <div className="relative inset-0 rounded-full bg-primary" />
      </div>

      {/* Step Number Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className={`absolute ${isEven ? "-left-4 lg:left-1/2 lg:-translate-x-1/2" : "-left-4 lg:right-1/2 lg:translate-x-1/2"} -top-8 lg:top-1/2 lg:-translate-y-1/2 z-20`}
      >
        <div className={`w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center shadow-lg ${colors.shadow}`}>
          <span className={`text-2xl font-black ${colors.text}`}>{step.id}</span>
        </div>
      </motion.div>

      {/* Visual Card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className={`w-full lg:w-[45%] bg-card rounded-3xl border border-border p-8 md:p-10 relative overflow-hidden group`}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Glow Effect */}
        <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`} />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 rounded-3xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300`}
          >
            <Icon className={colors.text} size={36} />
          </motion.div>

          {/* Content */}
          <span className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-2 block`}>
            {step.subtitle}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {step.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {step.desc}
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {step.details.map((detail, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} text-xs font-medium border ${colors.border}`}
              >
                <CheckCircle2 size={12} />
                {detail}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Spacer for alternating layout */}
      <div className="hidden lg:block w-[45%]" />

      {/* Mobile Spacer */}
      <div className="lg:hidden" />
    </motion.div>
  );
}

function FeaturesSection() {
  const features = [
    { label: "Response Time", value: "<100ms", desc: "Lightning fast delivery" },
    { label: "Uptime", value: "99.9%", desc: "Always available" },
    { label: "SMS Fallback", value: "120s", desc: "Quick offline switch" },
    { label: "Active Users", value: "12K+", desc: "Growing community" },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for <span className="text-primary">Performance</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enterprise-grade infrastructure powering campus-wide communication
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-all group"
            >
              <div className="text-3xl md:text-4xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">
                {feature.value}
              </div>
              <div className="text-sm font-bold text-foreground">{feature.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{feature.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[40px] overflow-hidden backdrop-blur-2xl
            bg-white/80 border border-border/50
            dark:bg-neutral-900/60 dark:border-white/10"
        >
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent pointer-events-none" />

          {/* Floating orbs */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-30"
          />
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-25"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 right-10 w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full blur-lg opacity-20"
          />

          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-600/40"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Beta Access Open
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight"
                >
                  Ready to Transform
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    Campus Communication?
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground text-lg leading-relaxed"
                >
                  Join 12,000+ students and staff already using UniNotify AI for smarter, 
                  faster, and more reliable campus notifications. Never miss an important update again.
                </motion.p>

                {/* Feature Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  <FeaturePill icon={<Cpu size={14} />} text="AI Powered" />
                  <FeaturePill icon={<ShieldCheck size={14} />} text="Verified" />
                  <FeaturePill icon={<Zap size={14} />} text="Instant SMS" />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative z-10">Get Started Free</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="group inline-flex items-center justify-center gap-3 bg-card border border-border text-foreground px-8 py-5 rounded-2xl font-bold text-lg hover:bg-accent transition-all"
                  >
                    <Play size={20} className="text-primary" />
                    Watch Demo
                  </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-6 pt-4 border-t border-border"
                >
                  <TrustBadge icon={CheckCircle2} text="Free Forever" />
                  <TrustBadge icon={CheckCircle2} text="No Credit Card" />
                  <TrustBadge icon={CheckCircle2} text="2-Min Setup" />
                </motion.div>
              </div>

              {/* Right - Phone Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative hidden lg:block"
              >
                <div className="relative mx-auto w-72">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-[60px] blur-3xl opacity-20" />

                  {/* Phone Frame */}
                  <div className="relative bg-neutral-900 rounded-[50px] p-3 border border-neutral-800 shadow-2xl">
                    {/* Screen */}
                    <div className="bg-neutral-950 rounded-[40px] overflow-hidden">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 py-3 text-white/50 text-xs">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-white/30 rounded-sm" />
                          <div className="w-4 h-2 bg-white/30 rounded-sm" />
                          <div className="w-6 h-3 bg-white/30 rounded-sm" />
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="px-5 pt-2 pb-4">
                        <h4 className="text-white font-bold text-lg">UniNotify AI</h4>
                        <p className="text-white/40 text-xs">3 new alerts</p>
                      </div>

                      {/* Notification Cards */}
                      <div className="space-y-3 px-3 pb-4">
                        <MockNotification color="blue" title="Lab Change" desc="Room 204 → Room 301" time="2m" />
                        <MockNotification color="purple" title="Exam Schedule" desc="CS201 Final - Dec 15" time="1h" />
                        <MockNotification color="emerald" title="Event Reminder" desc="Hackathon Tomorrow" time="3h" />
                      </div>

                      {/* Bottom Nav */}
                      <div className="flex justify-around py-4 border-t border-white/10">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg" />
                        <div className="w-6 h-6 bg-white/20 rounded-lg" />
                        <div className="w-6 h-6 bg-white/20 rounded-lg" />
                        <div className="w-6 h-6 bg-white/20 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Stats */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-12 top-16 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Users className="text-emerald-500" size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Active Now</p>
                        <p className="text-xl font-bold text-foreground">2,847</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -right-8 bottom-24 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Bell className="text-blue-500" size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Delivered</p>
                        <p className="text-xl font-bold text-foreground">850K+</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-border"
            >
              <CTAStat value="12K+" label="Active Users" />
              <CTAStat value="850K+" label="Alerts Sent" />
              <CTAStat value="99.9%" label="Uptime" />
              <CTAStat value="4.9" label="User Rating" suffix="/5" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturePill({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-sm font-medium">
      <span className="text-primary">{icon}</span>
      <span className="text-foreground">{text}</span>
    </div>
  );
}

function TrustBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="text-emerald-500" size={16} />
      <span>{text}</span>
    </div>
  );
}

function MockNotification({ color, title, desc, time }) {
  const colors = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800"
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 ${colors[color]} rounded-full mt-2 shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{title}</p>
          <p className="text-white/50 text-xs truncate">{desc}</p>
        </div>
        <span className="text-white/30 text-xs">{time}</span>
      </div>
    </motion.div>
  );
}

function CTAStat({ value, label, suffix = "" }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-black text-foreground">
        {value}<span className="text-primary">{suffix}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
