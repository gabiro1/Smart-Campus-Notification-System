import Announcement from "../model/Announcement.js";
import Course from "../../course/model/Course.js";
import User from "../../user/model/User.js"; 
// 🔧 FIX 1: The missing import that caused the silent crash. 
// (Adjust the relative path if your folder structure differs slightly)
import NotificationLog from "../../notification/models/NotificationLog.js"; 
import fs from "fs/promises";
import path from "path";
import { produceNotification } from "../../../services/notificationProducer.js";

// ==========================================
// 1. CREATE ANNOUNCEMENT (The Engine)
// ==========================================
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, courseId, type } = req.body;
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

    // --- 3. Create Announcement ---
    const newAnnouncement = new Announcement({
      title,
      content,
      lecturer: lecturerId,
      course: courseId,
      targetClass,
      type,
      attachments: attachedFileUrls,
    });

    await newAnnouncement.save();
    await newAnnouncement.populate("course", "name code");

    // --- 4. FCM Push Notification (BullMQ) ---
    const topic = `topic_class_${targetClass}`;
    try {
      await produceNotification({
        title,
        body: content,
        topic,
        type: "announcement",
        data: { announcementId: newAnnouncement._id.toString() },
      });
    } catch (notifyErr) {
      console.error("❌ FCM Push Failed:", notifyErr);
    }

    // --- 5. Create Notification Logs for Students ---
    const students = await User.find({ classId: targetClass }).select('_id');
    
    if (students.length > 0) {
      const logs = students.map((student) => ({
        studentId: student._id,
        senderId: lecturerId,
        title,
        message: content,
        type: "announcement", // 🔧 FIX 3: Matches the updated Enum in the schema
        status: "unread",
        referenceId: newAnnouncement._id, // 🔧 FIX 4: Changed from 'eventId' to prevent population crashes
      }));

      try {
        // High-performance bulk insert
        await NotificationLog.insertMany(logs);
        console.log(`✅ DB Logger: Saved ${logs.length} notifications to MongoDB.`);
      } catch (logErr) {
        console.error("❌ CRITICAL: Failed to save Notification Logs to DB:", logErr);
      }
    } else {
      console.warn(`⚠️ No students found for class ID: ${targetClass}. Database logs skipped.`);
    }

    // --- 6. Respond to Lecturer ---
    res.status(201).json({
      message: "Announcement broadcasted successfully",
      announcement: newAnnouncement,
      notifiedStudents: students.length,
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