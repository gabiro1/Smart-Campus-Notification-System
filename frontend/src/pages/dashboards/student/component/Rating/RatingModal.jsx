import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { useState } from "react";

export default function RatingModal({ isOpen, onClose, eventTitle }) {
  const [rating, setRating] = useState(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass w-full max-w-sm p-8 rounded-[40px] border border-white/10 z-10 text-center"
          >
            <h3 className="text-xl font-bold mb-2">How was the event?</h3>
            <p className="text-neutral-400 text-sm mb-6">{eventTitle}</p>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    size={32}
                    className={
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-neutral-600"
                    }
                  />
                </button>
              ))}
            </div>

            <button
              className="w-full bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
              onClick={onClose}
            >
              Submit Feedback
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
