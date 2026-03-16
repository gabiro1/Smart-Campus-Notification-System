import Announcement from "../model/Announcement.js";
import Course from "../../course/model/Course.js"; // UPGRADED: Import Course, not just Class
import fs from "fs/promises";
import path from "path";

// 1. Create Announcement (Advanced: Course-Aware with File Handling)
export const createAnnouncement = async (req, res) => {
  try {
    // UPGRADED: We expect courseId from the frontend now
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

    // --- FILE UPLOAD LOGIC (Your excellent code) ---
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
        // Note: For production (Render/Heroku), local files get wiped on restart. 
        // You'll eventually swap this block with a Firebase/Cloudinary upload.
        attachedFileUrls.push(`/uploads/${filename}`); 
      }
    }

    // --- SAVE TO DB ---
    const newAnnouncement = new Announcement({
      title,
      content,
      lecturer: lecturerId, // Assuming your schema uses 'lecturer' instead of 'author'
      course: courseId,     // Tag the specific subject!
      targetClass: targetClass, // Target the whole cohort!
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
      .populate("course", "name code") // UPGRADED: Tell the student WHICH subject this is for!
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