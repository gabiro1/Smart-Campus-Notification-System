import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";

export default function Explore() {
  const tags = ["#Cybersecurity", "#AI", "#Career", "#WebDev", "#Hardware"];

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="relative mb-8">
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
          size={20}
        />
        <input
          className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 rounded-2xl text-white outline-none focus:ring-2 ring-blue-600"
          placeholder="Search workshops, forums, or exams..."
        />
      </div>

      <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">
        Trending Tags
      </h3>
      <div className="flex flex-wrap gap-2 mb-10">
        {tags.map((tag) => (
          <span
            key={tag}
            className="glass px-4 py-2 rounded-full text-xs text-blue-400 border-blue-500/20"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recommended for You</h3>
        <div className="h-40 glass rounded-3xl border-dashed border-white/10 flex items-center justify-center text-neutral-600">
          Discover more events based on your interests
        </div>
      </div>
    </div>
  );
}
