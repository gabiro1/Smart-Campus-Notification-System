/**
 * @component PollCreator
 * @description Tool for adding interactive polls to committee announcements.
 */
export default function PollCreator() {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">
        Attach Feedback Poll (Optional)
      </h4>
      <div className="space-y-2">
        <input
          className="w-full bg-neutral-900/50 p-3 rounded-xl text-xs border border-white/5"
          placeholder="Question: Do you support the new gala venue?"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="bg-neutral-900/50 p-3 rounded-xl text-[10px]"
            placeholder="Option 1 (e.g., Yes)"
          />
          <input
            className="bg-neutral-900/50 p-3 rounded-xl text-[10px]"
            placeholder="Option 2 (e.g., No)"
          />
        </div>
      </div>
    </div>
  );
}
