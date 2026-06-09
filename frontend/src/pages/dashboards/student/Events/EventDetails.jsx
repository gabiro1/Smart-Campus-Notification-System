import { useParams, Link } from "react-router-dom";
import { GlassCard } from "@/components/shared";
import { ArrowLeft, Calendar, MapPin, Clock, Bookmark, Share2, User } from "lucide-react";

const eventData = {
  1: { title: "Sports Day", date: "Jun 10, 2026", time: "8:00 AM - 5:00 PM", location: "Main Field", organizer: "Sports Department", desc: "Annual inter-departmental sports competition featuring football, basketball, athletics, and more. All students are encouraged to participate or cheer for their departments.", category: "Sports" },
  2: { title: "Career Fair 2026", date: "Jun 15, 2026", time: "10:00 AM - 4:00 PM", location: "Auditorium", organizer: "Career Services", desc: "Meet recruiters from 30+ companies. Bring your resume and dress professionally. Workshops on interview skills will be held throughout the day.", category: "Career" },
  3: { title: "Workshop: Resume Building", date: "Jun 20, 2026", time: "2:00 PM - 4:00 PM", location: "Room 301", organizer: "Career Services", desc: "Learn how to craft a compelling resume that stands out to employers. Hands-on session with personalized feedback.", category: "Workshop" },
};

export default function EventDetails() {
  const { eventId } = useParams();
  const event = eventData[eventId];

  if (!event) {
    return (
      <GlassCard padding="p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Event not found</p>
          <Link to="/student/events" className="text-sm text-primary hover:text-primary/80 mt-2 inline-block">
            Back to events
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4 pb-8 max-w-3xl">
      <Link to="/student/events" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to events
      </Link>

      <GlassCard padding="p-0" hover={false}>
        {/* Banner */}
        <div className="h-36 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-background border-b border-border flex items-center justify-center">
          <Calendar size={48} className="text-muted-foreground/30" />
        </div>
        <div className="p-5 space-y-4">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{event.category}</span>
            <h1 className="text-xl font-bold text-foreground mt-1">{event.title}</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Calendar, label: "Date", value: event.date },
              { icon: Clock, label: "Time", value: event.time },
              { icon: MapPin, label: "Location", value: event.location },
              { icon: User, label: "Organizer", value: event.organizer },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/50">
                <Icon size={14} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-foreground font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-foreground mb-2">About this event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.desc}</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              <Bookmark size={14} /> Save Event
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-foreground text-sm font-semibold hover:bg-accent/80 transition-colors border border-border">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
