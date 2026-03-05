import GlassCard from "../components/GlassCard";
import { ImagePlus, MapPin, Clock } from "lucide-react";

export default function PostEvents() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Broadcast Event
        </h1>
        <p className="text-neutral-400">
          Create and publish events to the student body.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Side */}
        <GlassCard className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Event Title
            </label>
            <input
              type="text"
              className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
              placeholder="e.g. Annual Tech Symposium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Main Hall"
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Event Poster
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-blue-500/30 transition-all cursor-pointer bg-white/[0.01]">
              <ImagePlus size={32} className="mb-3 text-blue-400" />
              <p className="text-sm">Click to upload or drag and drop</p>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]">
            Publish Event
          </button>
        </GlassCard>

        {/* Live Preview Side */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Live Preview
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className="p-0 overflow-hidden relative border-blue-500/20"
          >
            <div className="h-48 bg-gradient-to-br from-blue-900/40 to-black w-full flex items-center justify-center">
              <ImagePlus size={48} className="text-blue-500/30" />
            </div>
            <div className="p-6">
              <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 mb-3">
                UPCOMING
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Annual Tech Symposium
              </h2>
              <div className="space-y-2 text-neutral-400 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span>October 24th, 2026 • 10:00 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-400" />
                  <span>Main Campus Auditorium</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
