import { motion } from "framer-motion";
import { Zap, ShieldCheck, Target, Smartphone } from "lucide-react";

const FEATURE_DATA = [
  {
    icon: <Target className="text-blue-500" />,
    title: "Precision Targeting",
    desc: "Alerts are sent to specific Levels and Departments. No more irrelevant notifications.",
  },
  {
    icon: <Zap className="text-yellow-500" />,
    title: "AI Recommendation",
    desc: "Our ML engine ranks events based on your personal interests and academic track.",
  },
  {
    icon: <Smartphone className="text-emerald-500" />,
    title: "Offline Fallback",
    desc: "Critical alerts are mirrored via SMS, ensuring you stay informed without internet data.",
  },
  {
    icon: <ShieldCheck className="text-purple-500" />,
    title: "Verified Sources",
    desc: "Only authorized Deans, HODs, and Guild members can broadcast through the platform.",
  },
];

export default function Features() {
  return (
    <section className="py-15 px-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-7">Powerful Features</h2>
        <p className="text-neutral-500">
          Engineered to solve real campus communication problems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {FEATURE_DATA.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-all group"
          >
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
