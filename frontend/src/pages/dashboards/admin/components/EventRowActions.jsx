// src/pages/dashboards/admin/components/EventRowActions.jsx
import { Eye, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EventRowActions({ event, onDelete, onEdit, onView }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onView(event)}
        className="p-2 text-neutral-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onEdit(event)}
        className="p-2 text-neutral-400 hover:text-amber-400 bg-white/5 hover:bg-amber-500/10 rounded-lg transition-colors"
        title="Edit Event"
      >
        <Edit size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(event.id || event._id)}
        className="p-2 text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Delete Event"
      >
        <Trash2 size={16} />
      </motion.button>
    </div>
  );
}
