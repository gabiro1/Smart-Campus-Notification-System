import Message from "../model/Message.js";
import User from "../../user/model/User.js";
import Class from "../../class/model/Class.js";
import { bucket } from "../../../config/firebaseAdmin.js";

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
// Helper: Get allowed contacts for current user
const getAllowedContactIds = async (user) => {
  const userRole = user.role.toLowerCase();
  let contactIds = [];

  if (userRole === "student") {
    const classes = await ClassModel.find({ studentIds: user._id });
    contactIds = classes.flatMap(c => c.lecturerIds);

  } else if (userRole === "lecturer") {
    const classes = await ClassModel.find({ lecturerIds: user._id });
    const studentIds = classes.flatMap(c => c.studentIds);
    const hodIds = classes.map(c => c.hodId);
    contactIds = [...new Set([...studentIds, ...hodIds])]; // remove duplicates

  } else if (userRole === "hod") {
    const departmentUsers = await User.find({ department: user.department });
    contactIds = departmentUsers.map(u => u._id);

  } else if (userRole === "admin") {
    const allUsers = await User.find();
    contactIds = allUsers.map(u => u._id);
  }

  // remove self
  return contactIds.filter(id => id.toString() !== user._id.toString());
};

// Send a message with class-based permissions
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType } = req.body;
    const senderId = req.user._id;

    // 1️⃣ Permission check
    const allowedContacts = await getAllowedContactIds(req.user);
    if (!allowedContacts.includes(receiverId)) {
      return res.status(403).json({ message: "You are not allowed to message this user." });
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

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Message Error:", error);
    res.status(500).json({ message: "Failed to send message" });
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