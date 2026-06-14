import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["lecturer", "ai", "student"], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

answerSchema.index({ question: 1, createdAt: 1 });

const Answer = mongoose.model("Answer", answerSchema);
export default Answer;
