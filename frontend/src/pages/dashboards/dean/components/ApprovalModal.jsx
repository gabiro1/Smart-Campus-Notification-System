import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

export default function ApprovalModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
}) {
  return (
    <AnimatePresence>
      {isOpen && item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {item.title}
                </h2>
                <p className="text-sm text-neutral-400">
                  Request by: <span className="text-white">{item.hod}</span> •{" "}
                  {item.dept}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 min-h-[150px] text-sm text-neutral-300 leading-relaxed mb-6">
              {item.message || "[Message Content Preview]"}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-500 font-medium">
                Target: {item.target}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => onReject(item.id)}
                  className="px-5 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(item.id)}
                  className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
