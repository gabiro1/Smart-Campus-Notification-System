// import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";

const DUMMY_EVENTS = [
  {
    id: 1,
    title: "Huawei ICT Competition 2026",
    tags: ["#Networking", "#Career"],
    score: 98,
    size: "large",
    color: "from-blue-600/20 to-blue-900/40",
  },
  {
    id: 2,
    title: "AI Research Workshop",
    tags: ["#MachineLearning"],
    score: 85,
    size: "small",
    color: "from-purple-600/20 to-purple-900/40",
  },
  {
    id: 3,
    title: "Level 4 IT Exam Review",
    tags: ["#Exam"],
    score: 92,
    size: "small",
    color: "from-red-600/20 to-red-900/40",
  },
  {
    id: 4,
    title: "Career Fair: Kigali Tech",
    tags: ["#Jobs", "#IT"],
    score: 70,
    size: "large",
    color: "from-emerald-600/20 to-emerald-900/40",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-32 px-6">
      <Navbar />

      <header className="mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-white"
        >
          Your Personalized Feed
        </motion.h2>
        <p className="text-neutral-500">Based on your level and interests</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        {DUMMY_EVENTS.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 0.98 }}
            className={`relative glass overflow-hidden rounded-[32px] border border-white/5 p-6 flex flex-col justify-between shadow-2xl ${
              event.size === "large" ? "col-span-2 h-56" : "col-span-1 h-64"
            } bg-gradient-to-br ${event.color}`}
          >
            {/* Match Badge */}
            <div className="flex justify-between items-start">
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                {event.score}% MATCH
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white leading-tight">
                {event.title}
              </h3>
              <div className="flex gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
