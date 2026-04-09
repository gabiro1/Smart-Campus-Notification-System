import GlassCard from "./GlassCard";

export default function AnnouncementTable({
  columns,
  data,
  renderRow,
  emptyMessage = "No records found.",
  delay = 0,
}) {
  return (
    <GlassCard
      delay={delay}
      className="p-0 overflow-hidden flex-1 flex flex-col"
    >
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-white/[0.02] border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`p-5 font-semibold ${col.align === "right" ? "text-right" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
