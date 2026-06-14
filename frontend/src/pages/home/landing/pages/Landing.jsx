import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ShieldCheck,
  Zap,
  Smartphone,
  Target,
  Cpu,
  Users,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Star,
  Play,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Globe,
} from "lucide-react";
import Navbar from "../../../../layouts/Navbar";
import Footer from "../../../../layouts/Footer";

const HERO_FEATURES = [
  { icon: Bell, label: "Instant Alerts" },
  { icon: Cpu, label: "AI Powered" },
  { icon: Smartphone, label: "SMS Fallback" },
];

const STATS = [
  { value: "12K+", label: "Active Users", icon: Users },
  { value: "850K+", label: "Alerts Delivered", icon: Bell },
  { value: "99.9%", label: "Uptime", icon: Globe },
  { value: "120s", label: "SMS Fallback", icon: Clock },
];

const FEATURES = [
  {
    icon: Target,
    title: "Precision Targeting",
    desc: "Alerts sent to specific Levels and Departments. No more irrelevant notifications.",
    color: "blue",
  },
  {
    icon: Zap,
    title: "AI Recommendation",
    desc: "Our ML engine ranks events based on your interests and academic track.",
    color: "amber",
  },
  {
    icon: Smartphone,
    title: "Offline Fallback",
    desc: "Critical alerts mirrored via SMS when offline. Stay informed anywhere.",
    color: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "Verified Sources",
    desc: "Only authorized Deans, HODs, and Guild members can broadcast.",
    color: "purple",
  },
  {
    icon: Calendar,
    title: "Calendar Sync",
    desc: "Sync events directly to your calendar. Never miss a deadline.",
    color: "rose",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Lecturers see real-time engagement metrics on their broadcasts.",
    color: "cyan",
    hidden: true,
  },
];

const TESTIMONIALS = [
  {
    name: "G.J. Fleuron",
    role: "Final Year IT Student",
    content: "UniNotify AI changed how I stay updated. The SMS fallback is a life-saver when my data runs out.",
    rating: 5,
    initials: "GJ",
  },
  {
    name: "Dr. M. Nshuti",
    role: "Senior Lecturer, UR-CST",
    content: "Knowing my announcements reach every student even offline gives me complete peace of mind.",
    rating: 5,
    initials: "MN",
  },
  {
    name: "S. Uwera",
    role: "Guild President",
    content: "The targeting precision means our events reach exactly who needs to know. No more spam complaints.",
    rating: 5,
    initials: "SU",
  },
];

const FAQS = [
  {
    q: "How does the AI determine notification priority?",
    a: "Our neural engine analyzes metadata from senders, cross-references with your enrolled modules, and calculates an Urgency Score. High-scoring alerts bypass the standard queue.",
  },
  {
    q: "Does SMS Fallback work with all Rwandan carriers?",
    a: "Yes! We integrate with local carrier infrastructure. If your device is offline for 120+ seconds, critical alerts automatically route via SMS.",
  },
  {
    q: "Is my academic data secure?",
    a: "Absolutely. We use end-to-end encryption and anonymized data tokens for AI processing. Your identity is never exposed.",
  },
];

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/30" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/30" },
};

export default function Landing() {
  const navigate = useNavigate();

  const handleAction = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      <HeroSection onAction={handleAction} />

      <StatsSection />

      <FeaturesSection />

      <HowItWorksSection />

      <TestimonialsSection />

      <FAQSection />

      <CTASection />

      <Footer />
    </div>
  );
}

function HeroSection({ onAction }) {
  const targetRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={targetRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] absolute"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[200px]"
        />
      </div>

      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[15%] hidden lg:block"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Bell className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">New Alert</p>
              <p className="text-sm font-semibold">Lab change - Room 204</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 left-[10%] hidden lg:block"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-sm font-semibold">2,847 students reached</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8 border border-primary/20"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary ">
            AI-Powered Campus Communication
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 Hide"
        >
         
          <br />
          <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Smart Alerts.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The ultimate bridge between University administration and students.
          Get the news you need, exactly when you need it powered by AI
          that learns your preferences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {HERO_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border text-sm"
            >
              <feature.icon className="text-primary" size={16} />
              <span className="text-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => onAction("/register")}
            className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            Join
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onAction("/how-it-works")}
            className="group inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent transition-all"
          >
            <Play size={20} className="text-primary" />
            See How It Works
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <ChevronDown className="text-muted-foreground" size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 px-6 border-y border-border bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                <stat.icon className="text-primary" size={24} />
              </div>
              <div className="text-3xl md:text-4xl font-black text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Engineered to solve real campus communication problems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.filter(f => !f.hidden).map((feature, i) => {
            const colors = colorMap[feature.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-card rounded-2xl border border-border p-8 hover:border-primary/30 transition-all cursor-default"
              >
                <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={colors.text} size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Admin Creates Alert",
      desc: "Authorized staff select target audience (school, level, department) and set priority.",
      color: "blue",
    },
    {
      num: "02",
      title: "AI Ranking",
      desc: "Our engine scores the alert based on urgency, relevance, and your profile.",
      color: "purple",
    },
    {
      num: "03",
      title: "Smart Delivery",
      desc: "Push notification if online, SMS fallback if offline. You get it either way.",
      color: "emerald",
    },
  ];

  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Intelligence Behind Every Alert
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps connect campus administration to students seamlessly.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const colors = colorMap[step.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative"
                >
                  <div className={`absolute -top-4 ${i === 1 ? "lg:left-1/2 lg:-translate-x-1/2" : i === 2 ? "lg:right-0" : "lg:left-0"} z-10`}>
                    <div className={`w-12 h-12 ${colors.bg} border-2 ${colors.border} rounded-2xl flex items-center justify-center`}>
                      <span className={`text-xl font-black ${colors.text}`}>{step.num}</span>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-8 pt-12 h-full hover:border-primary/30 transition-all">
                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by the Community
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Hear from students and staff who rely on UniNotify AI every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl border border-border p-8 hover:border-primary/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="text-amber-400 fill-amber-400" size={16} />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 italic">"{t.content}"</p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Questions? Answered.
          </h2>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="text-primary shrink-0" size={20} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-muted-foreground leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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
      <div className="absolute inset-0 -z-10">
        <GridBackground />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[40px] border border-border/50 overflow-hidden backdrop-blur-2xl
              light:bg-white/80 light:border light:border-slate-200/50
              dark:bg-neutral-900/60 dark:border dark:border-white/10"
          >
            {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent pointer-events-none" /> */}

            <div className="relative z-10 p-10 md:p-16">
              {/* <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-sm opacity-40"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-sm opacity-30"
              /> */}

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                      Now accepting users
                    </span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight"
                  >
                    Transform How Your Campus
                    <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                      Communicates
                    </span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground text-lg leading-relaxed"
                  >
                    Join 12,000+ students and staff already using UniNotify AI for 
                    smarter, faster, and more reliable campus notifications.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-6"
                  >
                    <TrustBadge icon={CheckCircle2} text="Free Plan" />
                    <TrustBadge icon={CheckCircle2} text="No Credit Card" />
                    <TrustBadge icon={CheckCircle2} text="2-Min Setup" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Link
                      to="/register"
                      className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/about"
                      className="group inline-flex items-center justify-center gap-3 bg-card border border-border text-foreground px-8 py-5 rounded-2xl font-bold text-lg hover:bg-accent transition-all"
                    >
                      <Play size={20} className="text-primary" />
                      Watch Demo
                    </Link>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="relative mx-auto w-72 md:w-80">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[60px] blur-2xl opacity-20" />
                    
                    <div className="relative bg-neutral-900 rounded-[50px] p-3 border border-neutral-800 shadow-2xl">
                      <div className="bg-neutral-950 rounded-[40px] overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-3 text-white/50 text-xs">
                          <span>9:41</span>
                          <div className="flex gap-1">
                            <div className="w-4 h-2 bg-white/30 rounded-sm" />
                            <div className="w-4 h-2 bg-white/30 rounded-sm" />
                            <div className="w-6 h-3 bg-white/30 rounded-sm" />
                          </div>
                        </div>

                        <div className="px-5 pt-2 pb-4">
                          <h4 className="text-white font-bold text-lg">Notifications</h4>
                          <p className="text-white/40 text-xs">3 new alerts</p>
                        </div>

                        <div className="space-y-3 px-3 pb-4">
                          <NotificationCard
                            color="blue"
                            title="Lab Change"
                            desc="Room 204 → Room 301"
                            time="2m ago"
                          />
                          <NotificationCard
                            color="purple"
                            title="Exam Schedule"
                            desc="CS201 Final - Dec 15"
                            time="1h ago"
                          />
                          <NotificationCard
                            color="emerald"
                            title="Event Reminder"
                            desc="Hackathon Tomorrow"
                            time="3h ago"
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -left-8 top-20 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <Users className="text-emerald-500" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Active Now</p>
                          <p className="text-lg font-bold text-foreground">2,847</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -right-4 bottom-20 bg-card border border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <Bell className="text-blue-500" size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                          <p className="text-lg font-bold text-foreground">850K+</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              
            </div>
          </motion.div>

          {/* <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]" />
          </div> */}
        </div>
      </div>
    </section>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
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

function NotificationCard({ color, title, desc, time }) {
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

function CTACounter({ value, label, suffix = "" }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-black text-foreground">
        {value}<span className="text-primary">{suffix}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
