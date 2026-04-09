import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Bookmark,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  QrCode,
  CheckCircle2,
  XCircle,
  CalendarPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import apiClient from "../../../../services/apiClient";
import eventService from "../../../../services/eventService";
import toast from "react-hot-toast";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
    } catch (e) {
      console.error('Failed to load user:', e);
    }

    const fetchEvent = async () => {
      try {
        const response = await apiClient.get(`/events/${eventId}`);
        const eventData = response.data;
        setEvent(eventData);
        
        // Check if user already checked in
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser._id) {
          // Check checked in
          const isCheckedIn = eventData.checkedInBy?.some(
            c => c.studentId?.toString() === storedUser._id.toString()
          );
          if (isCheckedIn) setCheckedIn(true);
          
          // Check user's existing rating
          const existingRating = eventData.ratings?.find(
            r => r.studentId?.toString() === storedUser._id.toString()
          );
          if (existingRating) {
            setUserRating(existingRating.rating);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Event not found");
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleBookmark = async () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    try {
      await eventService.toggleBookmark(eventId);
      toast.success(newState ? "Saved to bookmarks!" : "Removed from bookmarks", {
        style: { background: '#171717', color: '#fff', border: '1px solid #333' }
      });
    } catch {
      setIsBookmarked(!newState);
      toast.error("Failed to update bookmark");
    }
  };

  const handleRate = async (star) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/rate`, { rating: star });
      const data = response.data;
      
      // Update local rating state
      setUserRating(star);
      
      // Update event with new rating in the list
      if (event) {
        const updatedRatings = [
          ...(event.ratings || []).filter(r => r.studentId?.toString() !== user?._id?.toString()),
          { studentId: user?._id, rating: star }
        ];
        setEvent({ ...event, ratings: updatedRatings });
      }
      
      toast.success(data.message || "Rating submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rating failed");
    }
  };

  // QR Check-in Handler
  const handleQRCheckIn = async () => {
    if (!user || !user.studentID) {
      toast.error("Student ID not found. Please log in again.");
      return;
    }
    
    setCheckingIn(true);
    try {
      await apiClient.post(`/events/${eventId}/check-in`, {
        studentId: user._id,
        studentIdentifier: user.studentID || user.email
      });
      setCheckedIn(true);
      toast.success("Check-in successful! Attendance recorded.");
      setShowQRModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Calendar Export Handler
  const handleAddToCalendar = async () => {
    try {
      const response = await apiClient.get(`/events/${eventId}/calendar`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Event added to calendar!");
    } catch (err) {
      toast.error("Failed to export calendar. Please try again.");
    }
  };

  const getBadgeStyle = (level) => {
    if (level?.toLowerCase().includes("college")) return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    if (level?.toLowerCase().includes("school")) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-card">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8 min-h-screen bg-card">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 mb-6 hover:text-foreground transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 flex items-center gap-3">
          <AlertCircle size={20} /> {error || "Event not found"}
        </div>
      </div>
    );
  }

  const eventDate = event.date ? new Date(event.date) : null;
  const isUrgent = event.priority === "high" || event.priority === "urgent";

  return (
    <div className="min-h-screen bg-card text-foreground">
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Events</span>
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getBadgeStyle(event.approvalLevel)}`}>
                <ShieldCheck size={12} /> {event.approvalLevel || "Department"} Verified
              </div>
              {isUrgent && (
                <div className="flex items-center gap-1 text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Zap size={12} /> Urgent
                </div>
              )}
              {event.aiMatchScore > 0 && (
                <div className="flex items-center gap-1 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                  {Math.round(event.aiMatchScore)}% AI Match
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{event.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              {eventDate && (
                <span className="flex items-center gap-2">
                  <Calendar size={15} className="text-blue-500" />
                  {eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-blue-500" /> {event.location}
                </span>
              )}
            </div>

            {/* Poster */}
            {event.posterUrl && (
              <img src={event.posterUrl} alt={event.title} className="w-full rounded-2xl object-cover max-h-72 border border-border" />
            )}

            {/* Description */}
            <div className="bg-accent border border-border rounded-2xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">About this Event</h3>
              <p className="text-muted-foreground leading-relaxed">{event.description || "No description provided."}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Sidebar Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-[24px] p-6 sticky top-6 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Quick Actions</h3>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all ${
                  isBookmarked
                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                    : "bg-primary/10 border-border text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                {isBookmarked ? "Saved" : "Save Event"}
              </button>

              {/* QR Check-in Button */}
              {checkedIn ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={16} />
                  Checked In
                </div>
              ) : (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent text-foreground hover:opacity-90 transition-all"
                >
                  <QrCode size={16} />
                  Show QR to Check In
                </button>
              )}

              {/* Add to Calendar Button */}
              <button
                onClick={handleAddToCalendar}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-primary/10 border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all"
              >
                <CalendarPlus size={16} />
                Add to Calendar
              </button>

              {/* Rating */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  {userRating > 0 ? "Your Rating" : "Rate this Event"}
                </p>
                <div className="flex gap-1.5 justify-center" onMouseLeave={() => setHoveredStar(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onClick={() => handleRate(star)}
                      className="hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        size={22}
                        className={`transition-colors ${
                          star <= (hoveredStar || userRating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-neutral-700 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {event.ratings?.length > 0 && (
                  <p className="text-[10px] text-center text-muted-foreground mt-2 font-bold">
                    {(event.ratings.reduce((s, r) => s + (r.rating || 0), 0) / event.ratings.length).toFixed(1)} / 5 ({event.ratings.length} {event.ratings.length === 1 ? 'rating' : 'ratings'})
                  </p>
                )}
                {userRating > 0 && (
                  <p className="text-[10px] text-center text-emerald-400 mt-1 font-medium">
                    Thanks for rating!
                  </p>
                )}
              </div>

              {/* Created By */}
              {event.createdBy?.name && (
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1">Posted by</p>
                  <p className="text-sm font-bold text-foreground">{event.createdBy.name}</p>
                  {event.createdBy.department && (
                    <p className="text-xs text-muted-foreground">{event.createdBy.department}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
      </div>
    </div>

    {/* QR Code Check-in Modal */}
    {showQRModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center"
        >
          <h2 className="text-xl font-bold text-foreground mb-2">Event Check-In</h2>
          <p className="text-muted-foreground text-sm mb-6">Show this QR code to the event organizer</p>
          
          {/* QR Code Display */}
          <div className="bg-white p-4 rounded-2xl inline-block mb-6">
            <QRCodeSVG
              value={JSON.stringify({
                e: eventId,
                s: user?.studentID || user?._id,
                n: user?.name
              })}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          
          {/* Event Info */}
          <div className="mb-6 p-3 bg-accent rounded-xl border border-border">
            <p className="text-foreground font-semibold text-sm">{event?.title}</p>
            {eventDate && (
              <p className="text-muted-foreground text-xs mt-1">
                {eventDate.toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Check-in Button */}
          <button
            onClick={handleQRCheckIn}
            disabled={checkingIn}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-foreground hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checkingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Confirm Check-In
              </>
            )}
          </button>
          
          {/* Cancel Button */}
          <button
            onClick={() => setShowQRModal(false)}
            className="w-full mt-3 py-3 rounded-xl font-bold text-sm bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
          >
            Cancel
          </button>
          
          {/* Help Text */}
          <p className="text-muted-foreground text-xs mt-4">
            Have the organizer scan this QR code to confirm your attendance
          </p>
        </motion.div>
      </div>
      )}
    </div>
  );
}
