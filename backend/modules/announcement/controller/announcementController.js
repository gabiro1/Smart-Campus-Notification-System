import Announcement from "../model/Announcement.js";
import Class from "../../class/model/Class.js";

// 1. Lecturer creates a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetClass, type, attachments } = req.body;
    const lecturerId = req.user._id; // From your auth middleware

    // Verify the class exists
    const classExists = await Class.findById(targetClass);
    if (!classExists) {
      return res.status(404).json({ message: "Class not found" });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      lecturer: lecturerId,
      targetClass,
      type,
      attachments
    });

    await newAnnouncement.save();
    
    // Future step: Here is where we will trigger Push Notifications/Emails!
    
    res.status(201).json({ message: "Announcement sent successfully", announcement: newAnnouncement });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

// 2. Get all announcements for a specific class (Used by Students & Lecturers)
export const getClassAnnouncements = async (req, res) => {
  try {
    const { classId } = req.params;

    const announcements = await Announcement.find({ targetClass: classId })
      .populate("lecturer", "name profilePicture")
      .populate("comments.user", "name role profilePicture") // Get details of who commented
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// 3. Add a question/comment to an announcement (The Q&A Feature)
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // Announcement ID
    const { content } = req.body;
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Push the new question/comment into the array
    announcement.comments.push({
      user: userId,
      content
    });

    await announcement.save();

    res.status(201).json({ message: "Comment added", announcement });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};