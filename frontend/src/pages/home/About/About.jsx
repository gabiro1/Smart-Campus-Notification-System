import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Radio,
  ChevronDown,
  Eye,
  Target,
  Users,
  Zap,
  Quote,
  Mail,
  Landmark,
} from "lucide-react";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";

const STATS = [
  {
    label: "Active students",
    value: "12K+",
    trend: "+15% MoM",
    icon: <Users size={20} />,
    color: "blue",
  },
  {
    label: "Alerts delivered",
    value: "850K",
    trend: "99.9% Uptime",
    icon: <Zap size={20} />,
    color: "emerald",
  },
  {
    label: "AI Accuracy",
    value: "96%",
    trend: "Priority Filter",
    icon: <Sparkles size={20} />,
    color: "purple",
  },
  {
    label: "SMS Fallback",
    value: "45K",
    trend: "Offline Reach",
    icon: <Radio size={20} />,
    color: "amber",
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
  {
    content:
      "As a lecturer, knowing that my announcements reach every student even offline gives me peace of mind. The AI prioritization means urgent class changes get through immediately.",
    author: "Dr. M. Nshuti",
    role: "Senior Lecturer, UR-CST",
    initials: "MN",
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
  {
    question: "How do I install the PWA on my phone?",
    answer:
      "Simply visit uninotify.ac.rw on your mobile browser and tap 'Add to Home Screen' when prompted. The app works offline and syncs when connectivity returns.",
  },
];

export default function About() {
  const fadeInVariant = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-24">
        {/* --- HERO SECTION --- */}
        <motion.section {...fadeInVariant} className="text-center space-y-6">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            About <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">UniNotify AI</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Bridging the communication gap at the University of Rwanda through
            intelligent notifications and universal accessibility.
          </p>

          {/* Animated Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-xl border-2 border-border flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-3 rounded-full bg-primary" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* --- VISION & MISSION --- */}
        <motion.section
          {...fadeInVariant}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="bg-card p-10 rounded-[24px] border border-border space-y-4 hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Our Vision
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To build a campus where information friction is zero. We envision a
              digital ecosystem where technology acts as an invisible hand,
              guiding students to academic success.
            </p>
          </div>

          <div className="bg-card p-10 rounded-[24px] border border-border space-y-4 hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To eliminate communication gaps through AI-driven prioritization
              and hybrid SMS routing, ensuring 100% reach for critical academic
              updates.
            </p>
          </div>
        </motion.section>

        {/* --- IMPACT STATISTICS --- */}
        <motion.section {...fadeInVariant} className="space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Project Impact
            </h2>
            <p className="text-muted-foreground mt-2">
              Numbers that matter for campus communication
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border text-center hover:border-primary/30 transition-all"
              >
                <div className={`text-${stat.color}-500 flex justify-center mb-3`}>
                  {stat.icon}
                </div>
                <h4 className="text-3xl font-bold text-foreground tracking-tighter">
                  {stat.value}
                </h4>
                <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wide">
                  {stat.label}
                </p>
                <span className={`inline-block mt-3 px-3 py-1 bg-${stat.color}-500/10 text-${stat.color}-500 text-[10px] font-bold rounded-full`}>
                  {stat.trend}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- TESTIMONIALS SECTION --- */}
        <motion.section {...fadeInVariant} className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              What People Say
            </h2>
            <p className="text-muted-foreground mt-2">
              Real experiences from the UR community
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card p-8 rounded-2xl border border-border relative overflow-hidden hover:border-primary/30 transition-all"
              >
                <Quote
                  className="absolute top-4 right-4 text-primary/10"
                  size={48}
                />
                <div className="relative z-10 space-y-6">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    "{t.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{t.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- PROJECT TEAM --- */}
        <motion.section {...fadeInVariant} className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Meet the Team
            </h2>
            <p className="text-muted-foreground mt-2">
              The minds behind UniNotify AI
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center space-y-4 group"
              >
                <div className="w-28 h-28 rounded-full bg-card border-2 border-border flex items-center justify-center font-bold text-primary text-2xl group-hover:border-primary group-hover:scale-105 transition-all duration-300">
                  {member.initials}
                </div>
                <div className="text-center">
                  <h4 className="text-foreground font-bold text-lg">
                    {member.name}
                  </h4>
                  <p className="text-primary text-xs font-semibold uppercase tracking-wider mt-1">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- FAQS --- */}
        <motion.section
          {...fadeInVariant}
          className="space-y-8 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mt-2">
              Everything you need to know about UniNotify AI
            </p>
          </div>
          <div className="space-y-3">
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
        <motion.section {...fadeInVariant} className="py-12">
          <div className="bg-card p-10 md:p-16 rounded-3xl border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <div className="grid md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">
                    Get in Touch
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Have questions about UniNotify AI or want to collaborate?
                    We'd love to hear from you.
                  </p>
                </div>
                <div className="space-y-4">
                  <ContactDetail
                    icon={<Mail size={18} />}
                    title="Email"
                    detail="support@uninotify.ac.rw"
                  />
                  <ContactDetail
                    icon={<Landmark size={18} />}
                    title="Location"
                    detail="University of Rwanda, CST"
                  />
                  <ContactDetail
                    icon={<Zap size={18} />}
                    title="Response Time"
                    detail="Within 24 hours"
                  />
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    className="bg-accent border border-border p-4 rounded-xl outline-none focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="bg-accent border border-border p-4 rounded-xl outline-none focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Institutional email"
                  className="w-full bg-accent border border-border p-4 rounded-xl outline-none focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground"
                />
                <textarea
                  rows="4"
                  placeholder="Your message..."
                  className="w-full bg-accent border border-border p-4 rounded-xl outline-none focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground resize-none"
                />
                <button
                  type="button"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

function ContactDetail({ icon, title, detail }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <p className="text-foreground font-medium">{detail}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:border-primary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left gap-4"
      >
        <span className="font-semibold text-foreground">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-primary shrink-0"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-5 pb-5"
          >
            <p className="text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
