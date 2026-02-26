/**
 * @page HowItWorks
 * @description Features a scroll-triggered fade-in animation and a moving shader-style background.
 */
import Footer from "@/layouts/Footer";
import Navbar from "@/layouts/Navbar";
import { motion, useScroll, useTransform } from "framer-motion";
import { Cpu, Send, ShieldCheck, Zap } from "lucide-react";

const STEPS = [
  {
    id: "01",
    title: "Official Origin",
    icon: <ShieldCheck />,
    desc: "Information is drafted by verified University Staff or Student Leaders. No unofficial sources, no fake news.",
    color: "text-blue-500"
  },
  {
    id: "02",
    title: "Neural Ranking",
    icon: <Cpu />,
    desc: "Our AI Pulse engine matches the alert metadata with your department and level to determine your feed priority.",
    color: "text-purple-500"
  },
  {
    id: "03",
    title: "Hybrid Delivery",
    icon: <Zap />,
    desc: "The system detects your connectivity. If offline, the SMS Gateway triggers a fallback alert instantly.",
    color: "text-yellow-500"
  },
  {
    id: "04",
    title: "Student Response",
    icon: <Send />,
    desc: "Users react, rate, and sync events to their calendars, providing data that improves the AI ranking.",
    color: "text-emerald-500"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <Navbar />
      {/* --- SHADER-LIKE MOVING BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none">
        {/* <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" /> */}
        {/* <div
          // className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-bounce"
          style={{ animationDuration: "10s" }}
        /> */}
      </div>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6"
        >
          The Mechanics<span className="text-neutral-600"> <br />of Truth.</span>{" "}
          <br />
        </motion.h1>
        <p className="text-white max-w-lg mx-auto font-medium">
          Behind every notification is a complex sequence of AI ranking and
          hybrid routing.
        </p>
      </section>

      {/* --- SCROLL STEPS --- */}
      <section className="max-w-4xl mx-auto px-6 pb-40 relative z-10">
        <div className="space-y-40">
          {STEPS.map((step, i) => (
            <ScrollItem key={i} step={step} index={i} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

/**
 * @component ScrollItem
 * @description Handles individual step animation on scroll.
 */
function ScrollItem({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ margin: "-20%", once: false }}
      className="flex flex-col md:flex-row gap-12 items-center"
    >
      {/* Visual Identity */}
      <div className="relative">
        <div className="text-[12rem] font-black text-white/[0.03] leading-none select-none">
          {step.id}
        </div>
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 glass rounded-[40px] border border-white/10 ${step.color} shadow-2xl`}
        >
          {step.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 text-center md:text-left">
        <h3 className="text-3xl font-bold tracking-tight">{step.title}</h3>
        <p className="text-neutral-400 text-lg leading-relaxed font-medium">
          {step.desc}
        </p>
        <div className="h-1 w-20 bg-blue-600/20 rounded-full mx-auto md:mx-0" />
      </div>
    </motion.div>
  );
}