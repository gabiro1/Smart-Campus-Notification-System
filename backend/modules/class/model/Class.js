import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "CS101"
  hod: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lecturers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // assigned by HoD
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // static, registered at year start
  department: String,
  level: String, // e.g., Year 1, Year 2
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);
export default Class;