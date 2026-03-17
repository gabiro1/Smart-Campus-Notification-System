import Announcement from "../model/Announcement.js";
import Course from "../../course/model/Course.js";
import User from "../../user/model/User.js"; // ✅ THE FIX: The missing User model
import fs from "fs/promises";
import path from "path";

// 1. Create Announcement (Advanced: Course-Aware with File Handling)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, courseId, type } = req.body;
    const lecturerId = req.user._id; 

    // --- ADVANCED LOGIC: Find Course and Infer Class ---
    const course = await Course.findById(courseId).populate('class');
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Security Check: Ensure this lecturer actually teaches this specific course
    if (course.lecturer.toString() !== lecturerId.toString()) {
      return res.status(403).json({ message: "You are not authorized to post in this course" });
    }

    // Auto-extract the class target so the lecturer doesn't have to
    const targetClass = course.class._id; 

    // --- FILE UPLOAD LOGIC ---
    const attachedFileUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(process.cwd(), "uploads");
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      for (const file of req.files) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `attachment-${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, filename);

        await fs.writeFile(filePath, file.buffer);
        attachedFileUrls.push(`/uploads/${filename}`); 
      }
    }

    // --- SAVE TO DB ---
    const newAnnouncement = new Announcement({
      title,
      content,
      lecturer: lecturerId, 
      course: courseId,     
      targetClass: targetClass, 
      type,
      attachments: attachedFileUrls
    });

    await newAnnouncement.save();
    
    // Populate for the immediate UI response
    await newAnnouncement.populate('course', 'name code');
    
    res.status(201).json({ message: "Announcement broadcasted successfully", announcement: newAnnouncement });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

// 2. Get Feed (Upgraded to show Subject Name)
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

// 3. Q&A Comments (Perfect as is)
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { content } = req.body;
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.comments.push({ user: userId, content });
    await announcement.save();

    await announcement.populate("comments.user", "name role profilePicture");

    res.status(201).json({ message: "Comment added", announcement });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// 4. Enterprise Read Receipt Logic (Perfect as is)
export const markAsViewed = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user._id; 

    await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { viewedBy: userId } } 
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mark Viewed Error:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
};

// 5. Notice Board (Dashboard Full Feed)
// @desc    Get all announcements for the logged-in student's class
// @route   GET /api/announcements/my-feed
export const getMyAnnouncements = async (req, res) => {
  try {
    // We now have the User model imported, so this won't crash!
    const student = await User.findById(req.user.id);

    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Fetch ALL announcements for their specific class
    const announcements = await Announcement.find({ targetClass: student.classId })
      .populate("lecturer", "name profilePicture") 
      .populate("course", "name code") 
      .sort({ createdAt: -1 }); 

    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error("Fetch Announcements Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};