import mongoose from "mongoose";

const EventRSVPSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ["going", "maybe", "declined"],
    default: "going"
  },
  // Physical attendance tracking via QR scan
  attended: {
    type: Boolean,
    default: false
  },
  scannedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate RSVP for same user+event
EventRSVPSchema.index({ eventId: 1, userId: 1 }, { unique: true });
// Fast lookup for attendance verification
EventRSVPSchema.index({ eventId: 1, attended: 1, scannedAt: 1 });

export default mongoose.model("EventRSVP", EventRSVPSchema);
