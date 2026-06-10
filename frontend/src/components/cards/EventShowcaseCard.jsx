import { CalendarDays, Heart, Users, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventShowcaseCard({
  image,
  title = "Event Title",
  description = "Event description goes here.",
  date = "Sunday, 15 Oct 2022",
  likes,
  guests,
  alt,
  onShare,
  onReadMore,
  className,
}) {
  return (
    <article
      className={cn(
        "flex flex-col md:flex-row bg-[#0B121F] border border-white/[0.06] rounded-2xl overflow-hidden",
        className,
      )}
    >
      <div className="w-full md:w-[35%] h-52 md:h-auto shrink-0 bg-slate-800">
        {image ? (
          <img
            src={image}
            alt={alt ?? title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <CalendarDays size={32} />
          </div>
        )}
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between min-w-0 gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-xl tracking-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
              {description}
            </p>
            <button
              onClick={onReadMore}
              className="text-sky-400 text-sm mt-3 font-medium hover:text-sky-300 transition-colors"
            >
              Read More...
            </button>
          </div>
          <button
            onClick={onShare}
            className="shrink-0 bg-sky-500 hover:bg-sky-400 rounded-full p-2.5 text-white transition-colors"
            aria-label="Share this event"
          >
            <Share2 size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-5 text-slate-400 text-xs">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            {date}
          </span>
          {likes && (
            <span className="flex items-center gap-1.5">
              <Heart size={14} aria-hidden="true" />
              {likes}
            </span>
          )}
          {guests && (
            <span className="flex items-center gap-1.5">
              <Users size={14} aria-hidden="true" />
              {guests}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
