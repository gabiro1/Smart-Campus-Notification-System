import Announcement from "../model/Announcement.js";
import Class from "../../class/model/Class.js"; 
import fs from "fs/promises";
import path from "path";

// 1. Create Announcement (with file handling)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetClass, type } = req.body;
    const lecturerId = req.user._id; 

    const classExists = await Class.findById(targetClass);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found" });
    }

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

    const newAnnouncement = new Announcement({
      title,
      content,
      lecturer: lecturerId,
      targetClass,
      type,
      attachments: attachedFileUrls
    });

    await newAnnouncement.save();
    
    res.status(201).json({ message: "Announcement broadcasted successfully", announcement: newAnnouncement });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

// 2. Get Feed
export const getClassAnnouncements = async (req, res) => {
  try {
    const { classId } = req.params;

    const announcements = await Announcement.find({ targetClass: classId })
      .populate("lecturer", "name profilePicture")
      .populate("comments.user", "name role profilePicture") 
      .sort({ createdAt: -1 }); 

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// 3. Q&A Comments
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

// 4. Enterprise Read Receipt Logic (Silent Tracker)
export const markAsViewed = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user._id; 

    // $addToSet ensures we only count the student once, no matter how many times they view it
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