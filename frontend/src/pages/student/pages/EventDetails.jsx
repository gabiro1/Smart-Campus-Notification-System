import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useEvents } from "../../../hooks";
import { motion } from "framer-motion";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventDetails, rateEvent, markInterested } = useEvents();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState(null);
  const [isMarkingInterested, setIsMarkingInterested] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventDetails(eventId);
        setEvent(data);
      } catch (err) {
        setError(err.message || "Event not found");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleRate = async (value) => {
    try {
      await rateEvent(eventId, value);
      setRating(value);
    } catch (err) {
      console.error("Rating failed:", err);
    }
  };

  const handleMarkInterested = async () => {
    setIsMarkingInterested(true);
    try {
      await markInterested(eventId);
    } catch (err) {
      console.error("Failed to mark interest:", err);
    } finally {
      setIsMarkingInterested(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
      });
    } else {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin w-12 h-12 text-blue-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 mb-6"
        >
          <ArrowLeft size={20} /> Back to Feed
        </motion.button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error || "Event not found"}
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isMatched = event.aiMatchScore > 80;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-400 mb-8 p-6"
      >
        <ArrowLeft size={20} /> Back to Feed
      </motion.button>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl border border-white/5"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-600/30">
                🔥 98% Match
              </span>
              <span className="text-neutral-500 text-sm">Posted 2h ago</span>
            </div>

            <h1 className="text-4xl font-bold mb-6">
              Huawei ICT Competition 2026
            </h1>
            <p className="text-neutral-400 leading-relaxed mb-8">
              Join the national preliminary round. This event is highly
              recommended based on your interest in Networking and Cloud
              Computing.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-neutral-300">
                <Calendar className="text-blue-500" /> <span>Feb 25, 2026</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <MapPin className="text-blue-500" />{" "}
                <span>Main Auditorium</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-3xl border border-white/5 sticky top-6"
          >
            <h3 className="text-lg font-bold mb-4 text-center">Interested?</h3>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg rounded-2xl mb-3">
              Set AI Reminder
            </Button>
            <p className="text-center text-xs text-neutral-500">
              We will notify you 1 hour before the event starts.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
