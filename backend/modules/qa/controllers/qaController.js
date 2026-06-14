import crypto from "crypto";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Announcement from "../../announcement/model/Announcement.js";
import { findSimilarQuestions } from "../services/similiarityService.js";

function hashContent(content) {
  return crypto.createHash("sha256").update(content.toLowerCase().trim()).digest("hex");
}

export const askQuestion = async (req, res) => {
  try {
    const { announcementId, content } = req.body;
    if (!announcementId || !content) {
      return res.status(400).json({ success: false, message: "announcementId and content are required" });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    const duplicates = await findSimilarQuestions(content, announcementId);
    if (duplicates.length > 0) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Similar questions found",
        similar: duplicates,
      });
    }

    const question = await Question.create({
      student: req.user._id,
      announcement: announcementId,
      content,
      contentHash: hashContent(content),
    });

    const populated = await Question.findById(question._id)
      .populate("student", "name email avatar")
      .populate("announcement", "title");

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("askQuestion error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const askQuestionForce = async (req, res) => {
  try {
    const { announcementId, content } = req.body;
    if (!announcementId || !content) {
      return res.status(400).json({ success: false, message: "announcementId and content are required" });
    }

    const question = await Question.create({
      student: req.user._id,
      announcement: announcementId,
      content,
      contentHash: hashContent(content),
    });

    const populated = await Question.findById(question._id)
      .populate("student", "name email avatar")
      .populate("announcement", "title");

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("askQuestionForce error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuestionsForAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const questions = await Question.find({ announcement: announcementId })
      .populate("student", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    const questionIds = questions.map((q) => q._id);
    const answers = await Answer.find({ question: { $in: questionIds } })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 })
      .lean();

    const answersByQuestion = {};
    for (const a of answers) {
      if (!answersByQuestion[a.question]) answersByQuestion[a.question] = [];
      answersByQuestion[a.question].push(a);
    }

    const data = questions.map((q) => ({
      ...q,
      answers: answersByQuestion[q._id] || [],
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getQuestionsForAnnouncement error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ student: req.user._id })
      .populate("student", "name email avatar")
      .populate("announcement", "title")
      .sort({ createdAt: -1 })
      .lean();

    const questionIds = questions.map((q) => q._id);
    const answers = await Answer.find({ question: { $in: questionIds } })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 })
      .lean();

    const answersByQuestion = {};
    for (const a of answers) {
      if (!answersByQuestion[a.question]) answersByQuestion[a.question] = [];
      answersByQuestion[a.question].push(a);
    }

    const data = questions.map((q) => ({
      ...q,
      answers: answersByQuestion[q._id] || [],
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getMyQuestions error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLecturerQuestions = async (req, res) => {
  try {
    const announcements = await Announcement.find({ lecturer: req.user._id }).select("_id title").lean();
    const announcementIds = announcements.map((a) => a._id);

    const questions = await Question.find({ announcement: { $in: announcementIds } })
      .populate("student", "name email avatar")
      .populate("announcement", "title")
      .sort({ createdAt: -1 })
      .lean();

    const questionIds = questions.map((q) => q._id);
    const answers = await Answer.find({ question: { $in: questionIds } })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 })
      .lean();

    const answersByQuestion = {};
    for (const a of answers) {
      if (!answersByQuestion[a.question]) answersByQuestion[a.question] = [];
      answersByQuestion[a.question].push(a);
    }

    const data = questions.map((q) => ({
      ...q,
      answers: answersByQuestion[q._id] || [],
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getLecturerQuestions error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    const role = req.user.role === "lecturer" || req.user.role === "hod" ? "lecturer" : "student";

    const answer = await Answer.create({
      question: id,
      user: req.user._id,
      role,
      content,
    });

    if (role === "lecturer") {
      question.isResolved = true;
      question.answeredByLecturer = true;
      question.resolvedAt = new Date();
      await question.save();
    }

    const populated = await Answer.findById(answer._id)
      .populate("user", "name email avatar");

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("answerQuestion error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnansweredCount = async (req, res) => {
  try {
    const announcements = await Announcement.find({ lecturer: req.user._id }).select("_id").lean();
    const announcementIds = announcements.map((a) => a._id);

    const count = await Question.countDocuments({
      announcement: { $in: announcementIds },
      answeredByLecturer: false,
    });

    return res.status(200).json({ success: true, data: { unansweredCount: count } });
  } catch (error) {
    console.error("getUnansweredCount error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
