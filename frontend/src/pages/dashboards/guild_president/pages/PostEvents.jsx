import { useState, useRef } from "react";
import GlassCard from "../components/GlassCard";
import { ImagePlus, MapPin, Clock, Loader2 } from "lucide-react";
import eventService from "../../../../services/eventService";
import { useToast } from "../../../../components/ui/ToastContext"; // <-- Import the custom hook

export default function PostEvents() {
  const fileInputRef = useRef(null);
  const { showToast } = useToast(); // <-- Initialize the toast function

  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    tags: "",
    posterUrl: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    setIsParsing(true);
    try {
      // Create local preview immediately
      const localPreviewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, posterUrl: localPreviewUrl }));

      const response = await eventService.parseFlyer(file);

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          title: response.parsedData.title || prev.title,
          date: response.parsedData.date || prev.date,
          time: response.parsedData.time || prev.time,
          location: response.parsedData.location || prev.location,
          description: response.parsedData.description || prev.description,
          tags: response.parsedData.tags
            ? response.parsedData.tags.join(", ")
            : prev.tags,
          posterUrl: response.posterUrl, // Real backend URL
        }));
        showToast("Flyer parsed successfully!", "success"); // <-- Added success toast
      }
    } catch (error) {
      console.error("Failed to parse flyer:", error);
      showToast(
        "AI Parsing failed. Please fill in the details manually.",
        "error",
      ); // <-- Replaced alert
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await eventService.createEvent(payload);
      showToast("Event published successfully!", "success"); // <-- Replaced alert

      // Reset form
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        tags: "",
        posterUrl: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (error) {
      console.error("Failed to publish event:", error);
      showToast(
        error.response?.data?.message || "Failed to publish event.",
        "error",
      ); // <-- Replaced alert
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Broadcast Event
        </h1>
        <p className="text-neutral-400">
          Create and publish events to the student body.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Side */}
        <GlassCard className="space-y-6 relative">
          {isParsing && (
            <div className="absolute inset-0 z-10 bg-[#0A0A0A]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border border-white/10">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
              <p className="text-white font-medium">
                AI is analyzing the flyer...
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                Extracting dates, location, and details
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
              placeholder="e.g. Annual Tech Symposium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Main Hall"
              className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief summary of the event..."
              className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Event Poster
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-blue-500/30 transition-all cursor-pointer bg-white/[0.01]"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <ImagePlus size={32} className="mb-3 text-blue-400" />
              <p className="text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-neutral-600 mt-1">
                PNG, JPG to auto-fill details via AI
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-white/[0.03] text-white font-semibold py-3 rounded-sm transition-all active:scale-[0.98] border border-white/20 hover:bg-white/[0.05] disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Event"}
          </button>
        </GlassCard>

        {/* Live Preview Side */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Live Preview
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className="p-0 overflow-hidden relative border-blue-500/20"
          >
            <div className="h-48 bg-gradient-to-br from-blue-900/40 to-black w-full flex items-center justify-center overflow-hidden">
              {formData.posterUrl ? (
                <img
                  src={formData.posterUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlus size={48} className="text-blue-500/30" />
              )}
            </div>
            <div className="p-6">
              <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 mb-3">
                UPCOMING
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {formData.title || "Event Title"}
              </h2>
              <div className="space-y-2 text-neutral-400 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span>
                    {formData.date
                      ? new Date(formData.date).toLocaleDateString()
                      : "Date"}
                    {formData.time ? ` • ${formData.time}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-400" />
                  <span>{formData.location || "Location"}</span>
                </div>
              </div>
              {formData.description && (
                <p className="mt-4 text-sm text-neutral-300 line-clamp-2">
                  {formData.description}
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
