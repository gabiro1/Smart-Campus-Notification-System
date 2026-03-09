import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function FormModal({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  onSubmit,
  submitText = "Save Changes",
  isDestructive = false, // If true, makes the submit button red
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg border border-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div className="mb-8">{children}</div>

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-bold text-neutral-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-95 ${
                  isDestructive
                    ? "bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                }`}
              >
                {submitText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
