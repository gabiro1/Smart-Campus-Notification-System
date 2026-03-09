// import { motion, AnimatePresence } from "framer-motion";

export default function StudentFeed() {
  const events = [
    { title: "Huawei ICT Forum", score: 95, color: "bg-blue-600" },
    { title: "Cybersecurity Workshop", score: 88, color: "bg-purple-600" },
    { title: "Sports Day", score: 20, color: "bg-neutral-800" },
  ];

  return (
    <div className="p-6 bg-neutral-950 min-h-screen">
      <nav className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">UniNotify AI</h1>
        <div className="w-10 h-10 rounded-full bg-blue-500"></div>
      </nav>

      <div className="grid grid-cols-2 gap-4">
        {events.map((event, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={event.title}
            className={`${event.score > 90 ? "col-span-2 h-48" : "col-span-1 h-40"} ${event.color} p-4 rounded-3xl relative overflow-hidden`}
          >
            <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded-md text-xs">
              {event.score}% Match
            </div>
            <h3 className="text-xl font-bold mt-auto absolute bottom-4">
              {event.title}
            </h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
