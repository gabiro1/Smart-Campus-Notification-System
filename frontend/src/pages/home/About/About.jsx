import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Radio,
  Smartphone,
  ChevronDown,
  Landmark,
  ShieldCheck,
  Zap,
  Target,
  Eye,
  Users,
  Quote,
  Mail,
  Globe,
  ArrowRight,
} from "lucide-react";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";

// --- DATA CONFIGURATION ---
const STATS = [
  {
    label: "Active students",
    value: "12K+",
    trend: "+15% MoM",
    icon: <Users size={20} />,
  },
  {
    label: "Alerts delivered",
    value: "850K",
    trend: "99.9% Uptime",
    icon: <Zap size={20} />,
  },
  {
    label: "AI Accuracy",
    value: "96%",
    trend: "Priority Filter",
    icon: <Sparkles size={20} />,
  },
  {
    label: "SMS Fallback",
    value: "45K",
    trend: "Offline Reach",
    icon: <Radio size={20} />,
  },
];

const TEAM = [
  { name: "GABIRO Jovial Fleuron", role: "Lead AI Engineer", initials: "GJF" },
  { name: "IRADUKUNDA Sandrine", role: "Frontend Architect", initials: "IS" },
  { name: "MUHORAKEYE Ange", role: "Backend & SMS Logic", initials: "MA" },
];

const TESTIMONIALS = [
  {
    content:
      "UniNotify AI changed how we communicate. I no longer worry about missing a lab change when my data is off. The SMS fallback is a life-saver for students living in areas with unstable internet.",
    author: "G.J. Fleuron",
    role: "Final Year IT Student, UR",
    initials: "GJ",
  },
];

const FAQS = [
  {
    question: "How does the AI determine notification priority?",
    answer:
      "Our neural engine analyzes metadata from the sender (Lecturer/HoD), cross-references it with your enrolled modules, and calculates an 'Urgency Score'. High-scoring academic alerts bypass the standard queue to reach you instantly.",
  },
  {
    question: "Does the SMS Fallback work with all Rwandan carriers?",
    answer:
      "Yes. We use a hybrid gateway that integrates with local infrastructure. If our heartbeat check detects your device is offline for more than 120 seconds, the critical alert is automatically converted and routed via SMS.",
  },
  {
    question: "Is my personal academic data secure?",
    answer:
      "Absolutely. We implement end-to-end encryption for all internal communications. The AI processing happens on anonymized data tokens, ensuring your identity is never exposed.",
  },
];

export default function About() {
  const fadeInVariant = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const hoverEffect = {
    scale: 1.02,
    y: -5,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(37, 99, 235, 0.3)",
    transition: { duration: 0.4, ease: "circOut" },
  };

  return (
    <div className="min-h-screen bg-neutral-950  text-white relative overflow-hidden ">
      <Navbar />

      {/* --- LAVA LAMP BACKGROUND --- */}
      {/* <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-lava-slow" />
        <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-purple-600/10 blur-[120px] rounded-full animate-lava-fast" />
      </div> */}

      <main className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto space-y-32 ">
        {/* --- HERO SECTION --- */}
        <motion.section {...fadeInVariant} className="text-center space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
            About us
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            UniNotify AI is a mission-critical bridge ensuring every student at
            the University of Rwanda stays informed, regardless of connectivity.
          </p>
        </motion.section>

        {/* --- VISION & MISSION --- */}
        <motion.section
          {...fadeInVariant}
          className="grid md:grid-cols-2 gap-8"
        >
          <motion.div
            whileHover={hoverEffect}
            className="glass p-10 rounded-[40px] border border-white/5 space-y-4 cursor-default transition-colors"
          >
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-600/10">
              <Eye size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Our vision
            </h2>
            <p className="text-neutral-400 leading-relaxed font-medium italic">
              To build a campus where information friction is zero. We envision
              a digital ecosystem where technology acts as an invisible hand,
              guiding students to academic success.
            </p>
          </motion.div>

          <motion.div
            whileHover={hoverEffect}
            className="glass p-10 rounded-[40px] border border-white/5 space-y-4 cursor-default transition-colors"
          >
            <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500 shadow-lg shadow-purple-600/10">
              <Target size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Our mission
            </h2>
            <p className="text-neutral-400 leading-relaxed font-medium italic">
              To eliminate communication gaps through AI-driven prioritization
              and hybrid SMS routing, ensuring 100% reach for critical academic
              updates.
            </p>
          </motion.div>
        </motion.section>

        {/* --- IMPACT STATISTICS --- */}
        <motion.section {...fadeInVariant} className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Project impact
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={hoverEffect}
                className="glass p-8 rounded-3xl border border-white/5 text-center group transition-all cursor-default"
              >
                <div className="text-blue-500 flex justify-center mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <h4 className="text-4xl font-bold text-white tracking-tighter">
                  {stat.value}
                </h4>
                <p className="text-[10px] text-neutral-500 font-bold mt-2 uppercase tracking-widest">
                  {stat.label}
                </p>
                <span className="inline-block mt-4 px-3 py-1 bg-blue-600/10 text-[10px] font-bold text-blue-400 rounded-full border border-blue-500/20">
                  {stat.trend}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- TESTIMONIAL SECTION --- */}
        <motion.section {...fadeInVariant} className="max-w-4xl mx-auto py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Student testimonials
            </h2>
          </div>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="glass p-12 rounded-[50px] border border-white/10 relative overflow-hidden transition-all"
            >
              <Quote className="absolute top-8 left-8 text-white/5" size={80} />
              <div className="relative z-10 space-y-8 text-center">
                <p className="text-xl md:text-2xl font-medium text-neutral-200 leading-relaxed italic">
                  "{t.content}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center font-bold text-blue-500">
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-lg">{t.author}</p>
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* --- PROJECT TEAM --- */}
        <motion.section {...fadeInVariant} className="space-y-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Project team
            </h2>
            <p className="text-neutral-500 text-sm font-medium mt-2">
              The students behind the innovation
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-16">
            {TEAM.map((member, i) => (
              <TeamMember key={i} {...member} />
            ))}
          </div>
        </motion.section>

        {/* --- FAQS --- */}
        <motion.section
          {...fadeInVariant}
          className="space-y-12 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Technical FAQ
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </motion.section>

        {/* --- CONTACT US SECTION --- */}
        <motion.section {...fadeInVariant} id="contact" className="py-20">
          <div className="glass p-8 md:p-16 rounded-[64px] border border-white/10 bg-white/[0.01] relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Contact us
                  </h2>
                  <p className="text-neutral-500 font-medium leading-relaxed">
                    Have questions about the AI Pulse engine or want to
                    collaborate? Our team is ready to assist you.
                  </p>
                </div>
                <div className="space-y-6">
                  <ContactDetail
                    icon={<Mail size={20} />}
                    title="Email"
                    detail="support@uninotify.ac.rw"
                  />
                  <ContactDetail
                    icon={<Landmark size={20} />}
                    title="Office"
                    detail="University of Rwanda, CST(NYARUGENGE)"
                  />
                  <ContactDetail
                    icon={<Zap size={20} />}
                    title="Response time"
                    detail="Within 24 hours"
                  />
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    className="glass bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="glass bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm text-white"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Institutional email"
                  className="w-full glass bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm text-white"
                />
                <textarea
                  rows="4"
                  placeholder="Your message..."
                  className="w-full glass bg-white/5 border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm text-white"
                />
                <button className="w-full bg-blue-600 py-4 rounded-2xl font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
                  Send message
                </button>
              </form>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

// --- REUSABLE SUB-COMPONENTS ---

function TeamMember({ name, role, initials }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="flex flex-col items-center space-y-4 group cursor-default"
    >
      <div className="w-24 h-24 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-blue-500 text-2xl group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-500">
        {initials}
      </div>
      <div className="text-center">
        <h4 className="text-white font-bold text-lg italic tracking-tight">
          {name}
        </h4>
        <p className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
          {role}
        </p>
      </div>
    </motion.div>
  );
}

function ContactDetail({ icon, title, detail }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
          {title}
        </p>
        <p className="text-white font-medium">{detail}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass rounded-[32px] border border-white/5 overflow-hidden transition-all hover:border-white/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between text-left group"
      >
        <span className="font-bold text-neutral-200 group-hover:text-blue-400 transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <ChevronDown className="text-blue-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="px-8 pb-8"
          >
            <p className="text-neutral-500 text-sm leading-relaxed border-t border-white/5 pt-6 font-medium italic">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
