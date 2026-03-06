import GlassCard from "./GlassCard";

export default function DataTable({
  columns,
  data,
  renderRow,
  emptyMessage = "No records found.",
  delay = 0,
}) {
  return (
    <div className="overflow-x-auto flex-1 custom-scrollbar">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-[#050505] border-b border-white/5 text-[10px] uppercase tracking-widest text-neutral-500">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`p-5 font-bold ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-12 text-center text-neutral-600 font-mono text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
