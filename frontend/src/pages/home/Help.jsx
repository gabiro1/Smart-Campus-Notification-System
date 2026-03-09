// import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";


const FAQ = [
  {
    q: "How does the AI recommend events?",
    a: "The system analyzes your department, level, and the interest tags you select to calculate a Match Score.",
  },
  {
    q: "Will I get notifications offline?",
    a: "For critical alerts (like venue changes), the system will automatically send an SMS fallback.",
  },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-white max-w-2xl mx-auto pb-32">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      <div className="space-y-4">
        {FAQ.map((item, i) => (
          <details
            key={i}
            className="glass rounded-2xl border border-white/5 group overflow-hidden"
          >
            <summary className="p-5 flex justify-between items-center cursor-pointer list-none font-medium hover:bg-white/5 transition-colors">
              {item.q}
              <ChevronDown
                size={18}
                className="group-open:rotate-180 transition-transform text-blue-500"
              />
            </summary>
            <div className="p-5 pt-0 text-neutral-400 text-sm border-t border-white/5 mt-2">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
