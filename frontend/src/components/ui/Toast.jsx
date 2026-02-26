import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-28 left-0 right-0 z-[200] flex justify-center px-6 pointer-events-none"
        >
          <div className="glass px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl pointer-events-auto">
            {type === "success" ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <AlertCircle className="text-red-400" size={20} />
            )}
            <span className="text-sm font-medium text-white">{message}</span>
            <button
              onClick={onClose}
              className="ml-4 text-neutral-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
