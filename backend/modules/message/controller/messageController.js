import Message from "../model/Message.js";
import User from "../../user/model/User.js";
import Class from "../../class/model/Class.js";
import Conversation from "../model/Conversation.js";
import { bucket } from "../../../config/firebaseAdmin.js";
import { getReceiverSocketId, io } from "../../../utils/socketServer.js";

// @desc    Get allowed contacts based on user role
// @route   GET /api/messages/contacts


// @desc    Get allowed contacts based on user role & class assignment
// @route   GET /api/messages/contacts
export const getContacts = async (req, res) => {
  try {
    const user = req.user;
    let contacts = [];

    if (user.role === "lecturer") {
      // Lecturer sees only students in their assigned classes
      const classes = await Class.find({ lecturers: user.id }).populate("students");
      const studentIds = classes.flatMap(c => c.students.map(s => s._id));
      contacts = await User.find({ _id: { $in: studentIds } }).select("name role department profilePicture");
    } 
    
    else if (user.role === "student") {
      // Student sees only lecturers teaching their class
      const classes = await Class.find({ students: user.id }).populate("lecturers");
      const lecturerIds = classes.flatMap(c => c.lecturers.map(l => l._id));
      contacts = await User.find({ _id: { $in: lecturerIds } }).select("name role department profilePicture");
    } 
    
    else {
      // Other roles (HoD, Admin, Dean, Principal) use your existing role hierarchy
      let allowedRoles = [];
      switch(user.role) {
        case "hod":
          allowedRoles = ["student", "lecturer", "dean", "principal"];
          break;
        case "admin":
          allowedRoles = ["student","lecturer","hod","dean","principal","guild_president"];
          break;
        case "principal":
        case "dean":
          allowedRoles = ["hod","lecturer","admin"];
          break;
      }
      contacts = await User.find({ role: { $in: allowedRoles }, _id: { $ne: user.id } }).select("name role department profilePicture");
    }

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Contacts Error:", error);
    res.status(500).json({ message: "Failed to fetch contact list" });
  }
};

// @desc    Send a message (Text or File)
// @route   POST /api/messages
// Helper: Get allowed contacts for current user (returns array of string IDs)
const getAllowedContactIds = async (user) => {
  if (!user || !user.role) return [];
  let allowedIds = [];
  const userRole = user.role.toLowerCase();

  try {
    if (userRole === "lecturer") {
      const classes = await Class.find({ lecturers: user.id });
      allowedIds = classes.flatMap(c => c.students);
    } 
    else if (userRole === "student") {
      const classes = await Class.find({ students: user.id });
      allowedIds = classes.flatMap(c => c.lecturers);
    } 
    else {
      let allowedRoles = [];
      switch(userRole) {
        case "hod":
          allowedRoles = ["student", "lecturer", "dean", "principal"];
          break;
        case "admin":
          allowedRoles = ["student","lecturer","hod","dean","principal","guild_president"];
          break;
        case "principal":
        case "dean":
          allowedRoles = ["hod","lecturer","admin"];
          break;
      }
      const users = await User.find({ role: { $in: allowedRoles } }).select("_id");
      allowedIds = users.map(u => u._id);
    }
    // Return strings to safely use .includes() later, filter out self
    return allowedIds.map(id => id.toString()).filter(id => id !== user.id.toString());
  } catch (error) {
    console.error("Error resolving allowed contacts:", error);
    return [];
  }
};

// Send a message with class-based permissions
export const sendMessage = async (req, res) => {
  try {
    // 1️⃣ Authentication Check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. User authentication token required." });
    }

    const { receiverId, content, messageType } = req.body;
    const senderId = req.user._id;

    // 2️⃣ Input Validation
    if (!receiverId) {
      return res.status(400).json({ message: "Bad Request: receiverId is required." });
    }
    if (!content && !req.file) {
      return res.status(400).json({ message: "Bad Request: Message cannot be empty." });
    }

    // 3️⃣ Permission check
    const allowedContacts = await getAllowedContactIds(req.user);
    if (!allowedContacts.includes(receiverId.toString())) {
      console.warn(`[Access Denied] User ${senderId} attempted to message ${receiverId}`);
      return res.status(403).json({ message: "Forbidden: You do not have permission to message this contact." });
    }

    // 2️⃣ Handle file upload if present
    let fileData = null;
    if (req.file) {
      const file = req.file;
      const fileName = `chats/${Date.now()}_${file.originalname}`;
      const blob = bucket.file(fileName);

      const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
      });

      await new Promise((resolve, reject) => {
        blobStream.on("error", (err) => reject(err));
        blobStream.on("finish", () => resolve());
        blobStream.end(file.buffer);
      });

      const [url] = await blob.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      fileData = {
        url,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    }

    // 3️⃣ Save message to MongoDB
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      messageType: messageType || (req.file ? "document" : "text"),
      file: fileData,
    });

    // 4️⃣ Handle Conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: newMessage._id
      });
    } else {
      conversation.lastMessage = newMessage._id;
      await conversation.save();
    }

    // 5️⃣ Emit Socket Event for real-time sync
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("==== MESSAGE ERROR DETAILED ====");
    console.error(error.message || error);
    console.error(error.stack);
    
    res.status(500).json({ 
      message: "Internal Server Error: Failed to send message.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// @desc    Get user's active conversations
// @route   GET /api/messages/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name profilePicture role department tags")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
      
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// @desc    Lecturer searches student by registration number
// @route   GET /api/messages/search-student?regNo=XXX
export const searchStudent = async (req, res) => {
  try {
    const { regNo } = req.query;
    if (!regNo) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    const student = await User.findOne({
      role: "student",
      registrationNumber: { $regex: regNo.trim(), $options: "i" }
    }).select("name email registrationNumber department level profilePicture");

    if (!student) {
      return res.status(404).json({ message: "Student not found with that registration number" });
    }

    res.status(200).json({ data: student });
  } catch (error) {
    console.error("Search Student Error:", error);
    res.status(500).json({ message: "Failed to search student" });
  }
};

// @desc    Student gets their course lecturers
// @route   GET /api/messages/my-lecturers
export const getMyLecturers = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint" });
    }

    const classes = await Class.find({ students: user.id })
      .populate("lecturers", "name email department profilePicture");

    const Course = (await import("../../course/model/Course.js")).default;

    const courses = await Course.find({ class: { $in: classes.map(c => c._id) } })
      .populate("lecturer", "name email department profilePicture")
      .select("name code lecturer");

    const lecturerMap = new Map();

    classes.forEach(cls => {
      (cls.lecturers || []).forEach(lect => {
        if (!lecturerMap.has(lect._id.toString())) {
          lecturerMap.set(lect._id.toString(), { ...lect.toObject(), courses: [] });
        }
      });
    });

    courses.forEach(course => {
      if (course.lecturer) {
        const lectId = course.lecturer._id.toString();
        if (!lecturerMap.has(lectId)) {
          lecturerMap.set(lectId, { ...course.lecturer.toObject(), courses: [course.name] });
        } else {
          const existing = lecturerMap.get(lectId);
          if (!existing.courses.includes(course.name)) {
            existing.courses.push(course.name);
          }
        }
      }
    });

    const lecturers = Array.from(lecturerMap.values()).map(lect => ({
      _id: lect._id,
      name: lect.name,
      email: lect.email,
      department: lect.department,
      profilePicture: lect.profilePicture,
      course: lect.courses?.[0] || "Course Lecturer",
      courses: lect.courses || [],
    }));

    res.status(200).json({ data: lecturers });
  } catch (error) {
    console.error("My Lecturers Error:", error);
    res.status(500).json({ message: "Failed to fetch your lecturers" });
  }
};

// @desc    Get total unread messages for current user
// @route   GET /api/messages/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Unread Count Error:", error);
    res.status(500).json({ message: "Failed to fetch unread messages count" });
  }
};

// @desc    Get chat history between two users
// @route   GET /api/messages/:otherUserId
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};


// @desc    Vote on a poll
// @route   PUT /api/messages/:messageId/vote
export const voteOnPoll = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user.id;

    // 1. Find the message
    const message = await Message.findById(messageId);
    if (!message || message.messageType !== "poll") {
      return res.status(404).json({ message: "Poll not found" });
    }

    // 2. Smart Voting Logic: Remove the user's previous vote (if any)
    // This prevents double-voting and allows them to change their mind
    message.poll.options.forEach((opt) => {
      opt.voters = opt.voters.filter((id) => id.toString() !== userId.toString());
    });

    // 3. Add the user's ID to the new selected option
    message.poll.options[optionIndex].voters.push(userId);

    // 4. Save to the database
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error("Voting Error:", error);
    res.status(500).json({ message: "Failed to register vote" });
  }
};