import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  announcement: { type: mongoose.Schema.Types.ObjectId, ref: "Announcement", required: true },
  content: { type: String, required: true },
  contentHash: { type: String, index: true },
  isResolved: { type: Boolean, default: false },
  answeredByLecturer: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  aiSuggestion: { type: String, default: null }
}, { timestamps: true });

questionSchema.index({ student: 1, announcement: 1 });
questionSchema.index({ contentHash: 1 });

const Question = mongoose.model("Question", questionSchema);
export default Question;
