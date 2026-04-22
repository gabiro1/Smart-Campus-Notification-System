import Announcement from "../model/Announcement.js";
import Course from "../../course/model/Course.js";
import User from "../../user/model/User.js";
import NotificationLog from "../../notification/models/NotificationLog.js";
import fs from "fs/promises";
import path from "path";
import { produceNotification } from "../../../services/notificationProducer.js";
import { classifyWithFallback } from "../../../services/aiClassificationService.js";
import { getPersonalizedContentBatch } from "../../../services/aiPersonalizationService.js";
import { shouldSendNow } from "../../../utils/quietHours.js";
import { sendMulticastNotification } from "../../../config/firebaseAdmin.js";
import { ensureCachedTranslation } from "../../../services/translationService.js";
import { chat } from "../../../services/aiProvider.js";

// ==========================================
// 1. CREATE ANNOUNCEMENT (The Engine)
// ==========================================
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, courseId, type, scheduledAt, requiresAcknowledgment = false } = req.body;
    const lecturerId = req.user?._id;

    if (!lecturerId) return res.status(401).json({ message: "Unauthorized access" });

    // --- 1. Validate Course ---
    const course = await Course.findById(courseId).populate("class");
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.lecturer.equals(lecturerId)) {
      return res.status(403).json({ message: "You are not authorized to post in this course" });
    }

    const targetClass = course.class?._id;
    if (!targetClass) return res.status(400).json({ message: "Course has no class assigned" });

    // --- 2. Handle File Uploads Safely ---
    const attachedFileUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(process.cwd(), "uploads");
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      for (const file of req.files) {
        try {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `attachment-${uniqueSuffix}${ext}`;
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, file.buffer);
          attachedFileUrls.push(`/uploads/${filename}`);
        } catch (fileErr) {
          console.error("Attachment Save Error:", fileErr);
        }
      }
    }

    // --- 3. Determine Status (Scheduled vs Immediate) ---
    let announcementStatus = "Active";
    let scheduledTime = null;

    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      announcementStatus = "Scheduled";
      scheduledTime = new Date(scheduledAt);
    }

    // --- 4. AI CLASSIFICATION (with defensive fallback) ─────────────────────
    let aiMetadata = null;
    try {
      const classification = await classifyWithFallback({
        title,
        content,
        senderRole: req.user.role
      });

      aiMetadata = {
        priority: classification.priority,
        tags: classification.tags,
        targetScope: classification.targetScope,
        category: classification.aiCategory,
        reasoning: classification.aiReasoning,
        usedAI: classification.usedAI,
        classifiedAt: new Date()
      };

      console.log(`[Announcement Creation] AI classification applied for "${title.substring(0, 50)}...":`, {
        priority: classification.priority,
        tags: classification.tags,
        usedAI: classification.usedAI
      });

    } catch (classificationErr) {
      // This should NOT happen - classifyWithFallback should never throw
      console.error('[Announcement Creation] ❌ Classification error:', classificationErr.message);
      aiMetadata = {
        priority: 'medium',
        tags: ['general'],
        targetScope: null,
        category: null,
        reasoning: 'Fallback due to error',
        usedAI: false,
        classifiedAt: new Date()
      };
    }

    // --- 5. Create Announcement ---
    const newAnnouncement = new Announcement({
      title,
      content,
      lecturer: lecturerId,
      course: courseId,
      targetClass,
      type,
      attachments: attachedFileUrls,
      status: announcementStatus,
      scheduledAt: scheduledTime,
      aiMetadata, // Store AI classification results
      requiresAcknowledgment: requiresAcknowledgment === true || requiresAcknowledgment === 'true'
    });

    await newAnnouncement.save();
    await newAnnouncement.populate("course", "name code");

    // --- 5. Dispatch Logic (Only if NOT scheduled) ---
    let dispatched = false;
    if (announcementStatus === "Active") {
      // Create Notification Logs for Students with AI personalization
      // Include role in selection for persona-based rewriting
      // Also fetch fcmToken, quietHours, and languagePreference for push/translation
      const students = await User.find({ classId: targetClass })
        .select('_id role fcmToken quietHours languagePreference')
        .lean();

      if (students.length > 0) {
        // Ensure Kinyarwanda translation is cached if needed (for Rw students)
        let cachedRw = null;
        try {
          cachedRw = await ensureCachedTranslation(newAnnouncement._id, title, content, students);
        } catch (err) {
          console.warn('[Translation] Failed to ensure translation:', err.message);
        }

        // Generate personalized content per student role
        let personalizedMap;
        try {
          personalizedMap = await getPersonalizedContentBatch(title, content, students);
        } catch (err) {
          console.warn('[Personalization] Failed for announcement, using generic content:', err.message);
          personalizedMap = new Map();
          students.forEach(u => personalizedMap.set(u._id.toString(), { title, message: content }));
        }

        // Override with Kinyarwanda translation for Rw-preferred students
        if (cachedRw) {
          students.filter(s => s.languagePreference === 'rw').forEach(s => {
            personalizedMap.set(s._id.toString(), { title: cachedRw.title, message: cachedRw.body });
          });
        }

        const logs = students.map((student) => {
          const variant = personalizedMap.get(student._id.toString()) || { title, message: content };
          return {
            studentId: student._id,
            senderId: lecturerId,
            title: variant.title,
            message: variant.message,
            type: "announcement",
            status: "unread",
            referenceId: newAnnouncement._id,
            priority: newAnnouncement.aiMetadata?.priority || 'medium',
            digestedAt: null,
            requiresAcknowledgment: newAnnouncement.requiresAcknowledgment,
            acknowledgedAt: null
          };
        });

        try {
          await NotificationLog.insertMany(logs);
          console.log(`✅ DB Logger: Saved ${logs.length} personalized notifications to MongoDB.`);
        } catch (logErr) {
          console.error("❌ CRITICAL: Failed to save Notification Logs to DB:", logErr);
        }

        // Send Push Notifications with quiet hours filtering
        const announcementPriority = newAnnouncement.aiMetadata?.priority || 'medium';
        const validRecipients = students.filter(u => {
          const hasToken = u.fcmToken && u.fcmToken.trim() !== "";
          if (!hasToken) return false;
          // Check quiet hours: only send if canSendNow returns true
          return shouldSendNow(u, announcementPriority);
        });

        if (validRecipients.length > 0) {
          // Group tokens by personalized variant to minimize API calls
          const tokenGroups = new Map();
          validRecipients.forEach(user => {
            const variant = personalizedMap.get(user._id.toString()) || { title, message: content };
            const key = `${variant.title}|||${variant.message}`;
            if (!tokenGroups.has(key)) tokenGroups.set(key, { title: variant.title, body: variant.message, tokens: [] });
            tokenGroups.get(key).tokens.push(user.fcmToken);
          });

          // Send each group as a multicast (max 500 tokens per batch)
          const pushPromises = [];
          for (const { title: pushTitle, body: pushBody, tokens } of tokenGroups.values()) {
            pushPromises.push(
              sendMulticastNotification(tokens, pushTitle, pushBody).catch(err => {
                console.error(`[Announcement] Push failed for ${tokens.length} tokens:`, err.message);
              })
            );
          }
          await Promise.all(pushPromises);
          dispatched = true;
          console.log(`✅ Announcement: Sent push to ${validRecipients.length} devices (filtered by quiet hours)`);
        }
      } else {
        console.warn(`⚠️ No students found for class ID: ${targetClass}. Database logs skipped.`);
      }
    }

    // --- 6. Respond to Lecturer ---
    res.status(201).json({
      message: announcementStatus === "Scheduled"
        ? "Announcement scheduled successfully"
        : "Announcement broadcasted successfully",
      announcement: newAnnouncement,
      status: announcementStatus,
      dispatched,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: "Failed to create announcement", error: error.message });
  }
};

// ==========================================
// 2. FETCH ANNOUNCEMENTS
// ==========================================
export const getClassAnnouncements = async (req, res) => {
  try {
    const { classId } = req.params;
    const announcements = await Announcement.find({ targetClass: classId })
      .populate("lecturer", "name profilePicture")
      .populate("course", "name code") 
      .populate("comments.user", "name role profilePicture") 
      .sort({ createdAt: -1 }); 

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

export const getMyAnnouncements = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Ghost token detected. Please log out and log back in." });
    }

    const student = await User.findById(req.user._id);

    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const announcements = await Announcement.find({ targetClass: student.classId })
      .populate("lecturer", "name profilePicture") 
      .populate("course", "name code") 
      .populate("comments.user", "name role profilePicture") 
      .sort({ createdAt: -1 }); 

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error("Fetch Announcements Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getLecturerAnnouncements = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const announcements = await Announcement.find({ lecturer: lecturerId })
      .populate("course", "name code")
      .populate("targetClass", "name")
      .populate("comments.user", "name role profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error("Fetch Lecturer Announcements Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==========================================
// 3. UPDATE & DELETE ANNOUNCEMENTS
// ==========================================
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const lecturerId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    if (announcement.lecturer.toString() !== lecturerId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this broadcast" });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.updatedAt = Date.now();

    await announcement.save();

    const updatedDoc = await Announcement.findById(id)
      .populate("course", "name code")
      .populate("targetClass", "name")
      .populate("comments.user", "name role profilePicture");

    res.status(200).json({ success: true, message: "Broadcast updated successfully", data: updatedDoc });
  } catch (error) {
    console.error("Update Announcement Error:", error);
    res.status(500).json({ message: "Failed to update broadcast" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    
    if (announcement.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this broadcast" });
    }

    await announcement.deleteOne();
    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

// ==========================================
// 4. INTERACTIVITY (VIEWS & COMMENTS)
// ==========================================
export const markAsViewed = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!req.user || !req.user._id) return res.status(401).json({ message: "Unauthorized access" });
    
    const userId = req.user._id; 
    const updatedDoc = await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { viewedBy: userId } },
      { returnDocument: 'after' } 
    );

    res.status(200).json({ success: true, viewCount: updatedDoc?.viewedBy?.length || 0 });
  } catch (error) {
    console.error("Mark Viewed Error:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { content } = req.body;
    if (!req.user || !req.user._id) return res.status(401).json({ message: "Unauthorized access" });
    
    const userId = req.user._id;
    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    announcement.comments.push({ user: userId, content });
    await announcement.save();
    await announcement.populate("comments.user", "name role profilePicture");

    res.status(201).json({ success: true, message: "Comment added", comments: announcement.comments });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    const comment = announcement.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    comment.content = content;
    comment.updatedAt = Date.now(); 
    await announcement.save();
    await announcement.populate("comments.user", "name role profilePicture");

    res.status(200).json({ success: true, message: "Comment updated", comments: announcement.comments });
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; 
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    const comment = announcement.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isCommentOwner = comment.user.toString() === userId.toString();
    const isLecturer = announcement.lecturer.toString() === userId.toString();

    if (!isCommentOwner && !isLecturer) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    announcement.comments.pull(commentId);
    await announcement.save();
    await announcement.populate("comments.user", "name role profilePicture");
    
    res.status(200).json({ success: true, message: "Comment deleted", comments: announcement.comments });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// ==========================================
// 5. ANALYTICS
// ==========================================
export const getLecturerStats = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const stats = await Announcement.aggregate([
      { $match: { lecturer: lecturerId } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalViews: { $sum: { $size: { $ifNull: ["$viewedBy", []] } } },
          totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } },
          uniqueCourses: { $addToSet: "$course" }
        }
      },
      {
        $project: {
          _id: 0,
          totalSent: 1,
          totalViews: 1,
          totalComments: 1,
          activeCourses: { $size: "$uniqueCourses" }
        }
      }
    ]);

    const defaultStats = { totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 };
    const finalStats = stats.length > 0 ? stats[0] : defaultStats;

    res.status(200).json({ success: true, data: finalStats });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==========================================
// 6. SCHEDULING: Get Pending Scheduled Announcements
// ==========================================
export const getScheduledAnnouncements = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const scheduled = await Announcement.find({
      lecturer: lecturerId,
      status: "Scheduled"
    })
    .populate("course", "name code")
    .populate("targetClass", "name")
    .sort({ scheduledAt: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    const total = await Announcement.countDocuments({
      lecturer: lecturerId,
      status: "Scheduled"
    });

    res.status(200).json({
      success: true,
      data: scheduled,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error("Fetch Scheduled Announcements Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch scheduled announcements" });
  }
};

// ==========================================
// 7. SCHEDULING: Cancel Scheduled Announcement
// ==========================================
export const cancelScheduledAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user._id;

    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, lecturer: lecturerId, status: "Scheduled" },
      { $set: { status: "Draft" }, $unset: { scheduledAt: "" } },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Scheduled announcement not found or already dispatched" });
    }

    res.status(200).json({
      success: true,
      message: "Scheduled announcement cancelled",
      data: announcement
    });
  } catch (error) {
    console.error("Cancel Scheduled Announcement Error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel scheduled announcement" });
  }
};

// ==========================================
// 8. SCHEDULING: Reschedule Announcement
// ==========================================
export const rescheduleAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    const lecturerId = req.user._id;

    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "scheduledAt is required" });
    }

    const newDate = new Date(scheduledAt);
    if (newDate <= new Date()) {
      return res.status(400).json({ success: false, message: "Scheduled time must be in the future" });
    }

    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, lecturer: lecturerId, status: "Scheduled" },
      { $set: { scheduledAt: newDate } },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Scheduled announcement not found or not in scheduled status" });
    }

    res.status(200).json({
      success: true,
      message: "Announcement rescheduled successfully",
      data: announcement
    });
} catch (error) {
    console.error("Reschedule Announcement Error:", error);
    res.status(500).json({ success: false, message: 'Failed to reschedule announcement' });
  }
};

// ==========================================
// 9. Q&A: Ask Question (Student)
// ==========================================
export const askQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Question content is required' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const student = await User.findById(req.user._id).select('name profilePicture');
    const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();

    const newQuestion = {
      user: req.user._id,
      content: content.trim(),
      isResolved: false,
      replies: []
    };

    announcement.qa.push(newQuestion);
    await announcement.save();
    await announcement.populate('qa.user', 'name profilePicture role');

    const savedQuestion = announcement.qa[announcement.qa.length - 1];

    res.status(201).json({
      success: true,
      message: 'Question added',
      question: {
        id: savedQuestion._id,
        type: 'student',
        user: { name: student.name, initials },
        text: content.trim(),
        timestamp: savedQuestion.createdAt,
        replies: []
      }
    });
  } catch (error) {
    console.error('Ask Question Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add question' });
  }
};

// ==========================================
// 10. Q&A: AI Answer (Auto-generate)
// ==========================================
export const getAIAnswer = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const question = announcement.qa.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const course = await Course.findById(announcement.course).select('name code');
    const lecturer = await User.findById(announcement.lecturer).select('name title');

    const systemPrompt = `You are "UniNotify AI", the official academic assistant for a smart campus notification system.
You help students understand announcements from their lecturers.

ANNOUNCEMENT DETAILS:
Title: ${announcement.title}
Course: ${course?.code || 'General'} - ${course?.name || ''}
Content: ${announcement.content}
Posted by: ${lecturer?.title || 'Professor'} ${lecturer?.name || 'Unknown'}

INSTRUCTIONS:
1. Answer the student's question based ONLY on the announcement content provided above.
2. If the answer cannot be found in the announcement, politely say so and suggest checking other sources or contacting the lecturer.
3. Be helpful, clear, and concise. Keep response under 4 sentences.
4. Use a friendly, professional tone.
5. Do NOT make up information that is not in the announcement.`;

    let aiReply;
    try {
      aiReply = await chat({
        systemPrompt,
        userMessage: question.content,
        tier: 'FAST',
        maxTokens: 300,
        temperature: 0.4,
      });
    } catch (err) {
      console.error('[AI Answer] Error:', err.message);
      aiReply = "I'm currently unavailable. Please check the notice board or contact your lecturer for more details.";
    }

    const aiReplyData = {
      type: 'ai',
      content: aiReply,
      createdAt: new Date()
    };

    question.replies.push(aiReplyData);
    await announcement.save();

    res.status(200).json({
      success: true,
      reply: {
        id: aiReplyData._id,
        type: 'ai',
        user: { name: 'AI Copilot', initials: 'AI' },
        text: aiReply,
        timestamp: aiReplyData.createdAt
      }
    });
  } catch (error) {
    console.error('AI Answer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to get AI answer' });
  }
};

// ==========================================
// 11. Q&A: Lecturer Answer
// ==========================================
export const addLecturerReply = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const { content } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (announcement.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the lecturer can answer' });
    }

    const question = announcement.qa.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const lecturer = await User.findById(req.user._id).select('name title role');
    const initials = lecturer.name.split(' ').map(n => n[0]).join('').toUpperCase();

    const replyData = {
      type: 'lecturer',
      user: req.user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    question.replies.push(replyData);
    question.isResolved = true;
    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Reply added',
      reply: {
        id: replyData._id,
        type: 'lecturer',
        user: { name: lecturer.name, initials, title: lecturer.title },
        text: content.trim(),
        timestamp: replyData.createdAt
      }
    });
  } catch (error) {
    console.error('Add Lecturer Reply Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};

// ==========================================
// 12. Q&A: Edit Question (Student)
// ==========================================
export const editQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const { content } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const question = announcement.qa.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own questions' });
    }

    question.content = content.trim();
    await announcement.save();
    await announcement.populate('qa.user', 'name profilePicture role');

    const updatedQuestion = announcement.qa.id(questionId);
    res.status(200).json({
      success: true,
      message: 'Question updated',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Edit Question Error:', error);
    res.status(500).json({ success: false, message: 'Failed to edit question' });
  }
};

// ==========================================
// 13. Q&A: Delete Question (Student)
// ==========================================
export const deleteQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const question = announcement.qa.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own questions' });
    }

    announcement.qa.pull(questionId);
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Question deleted'
    });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
};