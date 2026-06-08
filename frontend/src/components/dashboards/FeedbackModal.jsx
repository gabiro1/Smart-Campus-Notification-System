import { useState } from "react";
import { X } from "lucide-react";

export default function FeedbackModal({ isOpen, onClose, eventName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hovered, setHovered] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      const baseUrl =
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
        "http://localhost:8000/api";
      await fetch(`${baseUrl}/events/${"feedback"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
    } catch {
      console.log("Feedback submitted (mock):", { rating, comment });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment("");
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-[90vw] sm:max-w-[420px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium text-foreground">Event Feedback</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <p className="text-[13px] text-muted-foreground mb-4">
          {eventName || "Advanced Programming Workshop"}
        </p>

        {submitted ? (
          <p className="text-[13px] text-success text-center py-4">
            Thank you for your feedback!
          </p>
        ) : (
          <>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className={`text-[22px] transition-colors cursor-pointer ${
                    star <= (hovered || rating) ? "text-[#FACC15]" : "text-muted"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="text-[13px] text-foreground mb-2 block">
              How was your experience?
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full h-24 bg-muted border border-border text-foreground rounded-md p-3 text-[13px] resize-none focus:outline-none focus:border-foreground/20 placeholder:text-muted-foreground"
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full mt-4 bg-muted border border-border text-foreground rounded-md py-2.5 text-[13px] font-medium cursor-pointer hover:border-foreground/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
