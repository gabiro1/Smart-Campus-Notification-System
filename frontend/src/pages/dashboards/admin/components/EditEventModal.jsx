export default function EditEventModal({ event, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="glass w-full max-w-xl p-8 rounded-[40px] border border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-white">
          Edit Event Details
        </h2>
        <div className="space-y-4">
          <input
            className="w-full glass p-3 rounded-xl border-white/10"
            defaultValue={event?.title}
          />
          <textarea
            className="w-full glass p-3 rounded-xl border-white/10 h-32"
            defaultValue={event?.description}
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
            >
              Cancel
            </button>
            <button className="flex-1 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
