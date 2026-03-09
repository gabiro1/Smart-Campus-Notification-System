import GlassCard from "./GlassCard";
import { Search, Filter } from "lucide-react";

export default function AnnouncementTable({
  title,
  data,
  columns,
  renderRow,
  searchPlaceholder = "Search...",
  delay = 0,
}) {
  return (
    <GlassCard
      delay={delay}
      className="p-0 overflow-hidden flex flex-col min-h-[500px]"
    >
      {/* Optional Title Component */}
      {title && (
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      )}

      {/* Toolbar: Search & Filters */}
      <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 lg:col-span-9 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            size={16}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div className="md:col-span-4 lg:col-span-3 flex justify-end gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 w-full md:w-auto bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors">
            <Filter size={16} />{" "}
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Scrollable Data Table */}
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-5 font-semibold ${col.align === "right" ? "text-right" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* We use a render prop (`renderRow`) so the parent page decides exactly 
              how the data looks, but the table component handles the layout! 
            */}
            {data.map((item, index) => renderRow(item, index))}

            {/* Empty State Fallback */}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-neutral-500 text-sm"
                >
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
