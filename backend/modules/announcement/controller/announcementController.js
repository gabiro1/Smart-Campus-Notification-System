import Announcement from "../model/Announcement.js";
import Course from "../../course/model/Course.js";
import User from "../../user/model/User.js"; 
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

// 3. Enterprise Read Receipt Logic (Fixed Mongoose Warning & Null Crash)
export const markAsViewed = async (req, res) => {
  try {
    const { id } = req.params; 
    
    // Safety check in case the token is stale
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    
    const userId = req.user._id; 

    const updatedDoc = await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { viewedBy: userId } },
      { returnDocument: 'after' } 
    );

    res.status(200).json({ 
      success: true, 
      viewCount: updatedDoc?.viewedBy?.length || 0
    });
  } catch (error) {
    console.error("Mark Viewed Error:", error);
    res.status(500).json({ message: "Failed to update view count" });
  }
};

// 4. Notice Board (Dashboard Full Feed - Fixed Null Crash)
export const getMyAnnouncements = async (req, res) => {
  try {
    // DEFENSIVE FIX: If the user doesn't exist in the request, boot them out safely
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Ghost token detected. Please log out and log back in." });
    }

    const student = await User.findById(req.user._id);

    // If the student has no assigned class, just return an empty array safely
    if (!student || !student.classId) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Fetch ALL announcements for their specific class
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

// 5. Q&A Comments (Core Pipeline Only)
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { content } = req.body;
    
    // Safety check
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // 1. Push the comment into the embedded array
    announcement.comments.push({ user: userId, content });
    await announcement.save();

    // 2. Populate the user data so the frontend knows WHO commented
    await announcement.populate("comments.user", "name role profilePicture");

    // 3. Return the updated comments array to React
    res.status(201).json({ 
      success: true, 
      message: "Comment added", 
      comments: announcement.comments 
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// 6. Delete a Comment
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; 
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // 1. Find the specific comment inside the embedded array
    const comment = announcement.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 2. SECURITY CHECK: Ensure the user owns this comment (or is the lecturer)
    const isCommentOwner = comment.user.toString() === userId.toString();
    const isLecturer = announcement.lecturer.toString() === userId.toString();

    if (!isCommentOwner && !isLecturer) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    // 3. Rip the comment out of the array using Mongoose's .pull()
    announcement.comments.pull(commentId);
    await announcement.save();

    // 4. Return the freshly updated comments array to React
    await announcement.populate("comments.user", "name role profilePicture");
    
    res.status(200).json({ 
      success: true, 
      message: "Comment deleted", 
      comments: announcement.comments 
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// 7. Lecturer: Manage My Announcements (FIXED: Returns ALL data for the tabs to filter)
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

// 8. Lecturer: Delete an entire Announcement (NEW: The missing piece of the CRUD puzzle)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    
    // Security Check: Only the creator can delete their own broadcast
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


// 9. Update a Comment (Crucial for the "Update" button to work)
export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    // 1. Find the specific comment inside the array
    const comment = announcement.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // 2. SECURITY: Only the person who wrote the comment can edit it
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    // 3. Apply the update
    comment.content = content;
    comment.updatedAt = Date.now(); // Mark as edited
    
    await announcement.save();

    // 4. Return the full populated list so the UI refreshes perfectly
    await announcement.populate("comments.user", "name role profilePicture");

    res.status(200).json({ 
      success: true, 
      message: "Comment updated", 
      comments: announcement.comments 
    });
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

// 10. Lecturer: Update the actual Broadcast (Announcement)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const lecturerId = req.user._id;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Security Check: Only the lecturer who created it can edit it
    if (announcement.lecturer.toString() !== lecturerId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this broadcast" });
    }

    // Apply updates
    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.updatedAt = Date.now();

    await announcement.save();

    // Populate for the UI (Matches the format of getLecturerAnnouncements)
    const updatedDoc = await Announcement.findById(id)
      .populate("course", "name code")
      .populate("targetClass", "name")
      .populate("comments.user", "name role profilePicture");

    res.status(200).json({ 
      success: true, 
      message: "Broadcast updated successfully", 
      data: updatedDoc 
    });
  } catch (error) {
    console.error("Update Announcement Error:", error);
    res.status(500).json({ message: "Failed to update broadcast" });
  }
};


// NEW: High-Performance Aggregation Endpoint
export const getLecturerStats = async (req, res) => {
  try {
    const lecturerId = req.user._id;

    // The Aggregation Pipeline
    const stats = await Announcement.aggregate([
      // 1. Filter: Only get announcements created by this specific lecturer
      { $match: { lecturer: lecturerId } },
      
      // 2. Group & Calculate: Condense all documents into a single summary object
      {
        $group: {
          _id: null, // We want one grand total, so we group by null
          totalSent: { $sum: 1 }, // Count every document
          totalViews: { $sum: { $size: { $ifNull: ["$viewedBy", []] } } }, // Sum the length of the viewedBy arrays
          totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } }, // Sum the length of the comments arrays
          uniqueCourses: { $addToSet: "$course" } // Collect unique course IDs into a set
        }
      },
      
      // 3. Format: Clean up the output to make it easy for the frontend to consume
      {
        $project: {
          _id: 0,
          totalSent: 1,
          totalViews: 1,
          totalComments: 1,
          activeCourses: { $size: "$uniqueCourses" } // Count the unique courses
        }
      }
    ]);

    // If the lecturer has no announcements, the aggregation returns an empty array.
    // We provide a fallback object full of zeros.
    const defaultStats = { totalSent: 0, totalViews: 0, totalComments: 0, activeCourses: 0 };
    const finalStats = stats.length > 0 ? stats[0] : defaultStats;

    res.status(200).json({ success: true, data: finalStats });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};