/**
 * @page AISummary
 * @description Uses AI to condense multiple notifications into a 1-minute read.
 * Problem Solved: Information Overload.
 */
import { Sparkles, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AISummary() {
  const summaries = [
    {
      category: "Academic",
      content:
        "Dr. Jean moved the Network Security lab to Room 402. Prepare your Ethernet cables.",
      urgency: "High",
    },
    {
      category: "Social",
      content:
        "The Guild President announced a debate for Friday at 4 PM in the Great Hall.",
      urgency: "Medium",
    },
  ];

  return (
    <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">
            AI Pulse Summary
          </h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
            Last Updated: 5 mins ago
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {summaries.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="glass p-6 rounded-[32px] border border-white/5 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full ${item.urgency === "High" ? "bg-red-500" : "bg-blue-500"}`}
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                {item.category}
              </span>
              <Clock size={14} className="text-neutral-600" />
            </div>
            <p className="text-white text-sm leading-relaxed">{item.content}</p>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 glass border border-blue-500/20 text-blue-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600/10 transition-all">
        <Zap size={18} /> Regenerate Summary
      </button>
    </div>
  );
}
