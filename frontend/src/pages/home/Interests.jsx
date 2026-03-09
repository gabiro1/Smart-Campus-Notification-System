const TAGS = [
  "#Cybersecurity",
  "#AI",
  "#Career",
  "#WebDev",
  "#Hardware",
  "#SoftSkills",
];

export default function Interests() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">
        What interests you?
      </h2>
      <p className="text-neutral-400 mb-10">We'll use this to rank your feed</p>

      <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
        {TAGS.map((tag) => (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            key={tag}
            className="px-6 py-2 rounded-full border border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
