/**
 * @component AgendaBuilder
 * @description Allows the Speaker to structure Parliamentary sessions.
 * DEFENSE VALUE: Shows the system supports institutional governance, not just social media.
 */
export default function AgendaBuilder() {
  const [items, setItems] = useState([
    "Approval of last minutes",
    "Welfare report",
  ]);

  return (
    <div className="glass p-6 rounded-3xl border border-purple-500/20 bg-purple-500/5">
      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        📜 Session Order of Business
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm text-neutral-300 bg-black/20 p-2 rounded-xl"
          >
            <span className="text-purple-500 font-bold">{i + 1}.</span> {item}
          </div>
        ))}
        <button className="w-full mt-2 py-2 border border-dashed border-purple-500/30 rounded-xl text-[10px] text-purple-500 hover:bg-purple-500/10 transition-all">
          + Add Agenda Point
        </button>
      </div>
    </div>
  );
}
