// src/pages/dashboards/admin/components/EventsTable.jsx
import { motion, AnimatePresence } from "framer-motion";
import { CalendarX2 } from "lucide-react";
import EventRowActions from "./EventRowActions";

export default function EventsTable({
  events,
  loading,
  onDelete,
  onEdit,
  onView,
}) {
  if (loading) {
    return (
      <div className="w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse flex gap-4 p-6 border-b border-white/5"
          >
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <CalendarX2 size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-bold uppercase tracking-widest">
          No events found
        </p>
        <p className="text-xs mt-2">
          Adjust your filters or create a new event.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border">
          <tr>
            <th className="p-5">Event Details</th>
            <th className="p-5">Schedule & Location</th>
            <th className="p-5">Target Audience</th>
            <th className="p-5">Tags</th>
            <th className="p-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          <AnimatePresence>
            {events.map((event) => (
              <motion.tr
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={event.id || event._id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                {/* Details */}
                <td className="p-6">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors truncate max-w-[200px]">
                    {event.title}
                  </div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                    Added: {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </td>

                {/* Schedule */}
                <td className="p-6">
                  <div className="text-sm font-medium text-neutral-300">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 truncate max-w-[150px]">
                    📍 {event.location}
                  </div>
                </td>

                {/* Audience Hierarchy */}
                <td className="p-6">
                  <div className="text-sm text-neutral-300">
                    {event.targetSchool ||
                      event.targetCollege ||
                      "Global Campus"}
                  </div>
                  {event.targetDept && (
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mt-1">
                      {event.targetDept}{" "}
                      {event.targetLevel ? `(Lvl ${event.targetLevel})` : ""}
                    </div>
                  )}
                </td>

                {/* Tags */}
                <td className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {event.tags &&
                      event.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/5 text-neutral-400 text-[10px] font-medium rounded-md border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    {event.tags && event.tags.length > 2 && (
                      <span className="px-2 py-1 bg-white/5 text-neutral-500 text-[10px] font-medium rounded-md border border-white/10">
                        +{event.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="p-6 text-right">
                  <EventRowActions
                    event={event}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onView={onView}
                  />
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
