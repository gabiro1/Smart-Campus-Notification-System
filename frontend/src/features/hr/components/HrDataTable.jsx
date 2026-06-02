import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/cards/GlassCard";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import EmptyState from "@/components/feedback/EmptyState";
import ErrorState from "./ErrorState";

function HrDataTable({ columns, data, loading, error, onRetry, emptyIcon, emptyTitle, emptyDescription, keyExtractor }) {
  const headers = useMemo(() => columns.map((col) => col.header), [columns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error.message || "Failed to load data"} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle || "No data found"}
        description={emptyDescription || "No records available"}
      />
    );
  }

  return (
    <GlassCard padding="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <motion.tr
                key={keyExtractor ? keyExtractor(row) : row._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className || "text-sm text-muted-foreground"}`}>
                    {col.render ? col.render(row) : row[col.key] ?? "-"}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

export default memo(HrDataTable);
