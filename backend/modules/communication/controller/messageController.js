import Message from "../model/Message.js";
import ConversationThread from "../model/ConversationThread.js";
import User from "../../user/model/User.js";
import CommunicationLog from "../model/CommunicationLog.js";
import { verifyCommunicationPermission } from "../services/permissionGate.js";
import { emitNewMessage, emitThreadUpdate, emitMessageUpdated, emitMessageDeleted } from "../services/messageDelivery.js";
import path from "path";
import fs from "fs";
import { io, getReceiverSocketId } from "../../../utils/socketServer.js";

export const sendMessage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { threadId, content, messageType, recipientType, recipientId } = req.body;
    const senderId = req.user._id;

    if (!threadId) return res.status(400).json({ message: "threadId is required" });
    if (!content && !req.file) return res.status(400).json({ message: "Message cannot be empty" });

    const thread = await ConversationThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = thread.participants.some(p => p.toString() === senderId.toString());
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    if (thread.threadType !== "office_ticket" && thread.threadType !== "escalation") {
      for (const pId of thread.participants) {
        if (pId.toString() === senderId.toString()) continue;
        const permission = await verifyCommunicationPermission(req.user, pId.toString());
        if (!permission.allowed) {
          return res.status(403).json({
            message: permission.message,
            suggestedMode: permission.suggestedMode
          });
        }
      }
    }

    let fileData = null;
    if (req.file) {
      const file = req.file;
      const chatDir = path.join(process.cwd(), "uploads", "chats");
      if (!fs.existsSync(chatDir)) {
        fs.mkdirSync(chatDir, { recursive: true });
      }
      const fileName = `${Date.now()}_${file.originalname}`;
      const filePath = path.join(chatDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      fileData = {
        url: `/uploads/chats/${fileName}`,
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    }

    const newMessage = await Message.create({
      threadId,
      senderId,
      senderRole: req.user.role,
      recipientType: recipientType || "individual",
      recipientId: recipientId || thread.participants.find(p => p.toString() !== senderId.toString()),
      content,
      messageType: messageType || (req.file ? "document" : "text"),
      file: fileData,
      deliveryStatus: "sent"
    });

    thread.lastMessage = newMessage._id;
    thread.lastMessageAt = new Date();
    thread.messageCount = (thread.messageCount || 0) + 1;

    const unreadMap = thread.unreadCount || {};
    for (const p of thread.participants) {
      const pid = p.toString();
      if (pid !== senderId.toString()) {
        unreadMap[pid] = (unreadMap[pid] || 0) + 1;
      }
    }
    thread.unreadCount = unreadMap;
    await thread.save();

    await CommunicationLog.create({
      event: 'message_sent',
      actor: senderId,
      actorRole: req.user.role,
      targetType: 'Message',
      targetId: newMessage._id,
      metadata: { threadId, messageLength: content?.length || 0 },
      outcome: 'success'
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name role profilePicture");

    await emitNewMessage(populatedMessage, threadId);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const thread = await ConversationThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = thread.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    const total = await Message.countDocuments({ threadId });
    const messages = await Message.find({ threadId })
      .populate("senderId", "name role profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { threadId } = req.body;
    const userId = req.user._id;

    const thread = await ConversationThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Conversation not found" });

    const unreadMap = thread.unreadCount || {};
    unreadMap[userId.toString()] = 0;
    thread.unreadCount = unreadMap;
    await thread.save();

    await Message.updateMany(
      { threadId, "readBy.user": { $ne: userId } },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
        $set: { isRead: true }
      }
    );

    if (io) {
      const socketId = getReceiverSocketId(userId.toString());
      if (socketId) {
        io.to(socketId).emit("unread:updated", { threadId: threadId.toString(), count: 0 });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Can only delete own messages" });
    }

    await CommunicationLog.create({
      event: 'message_deleted',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'Message',
      targetId: message._id,
      outcome: 'success'
    });

    await emitMessageDeleted(message.threadId.toString(), message._id);
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, _id: message._id });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Can only edit own messages" });
    }
    if (message.messageType !== "text") {
      return res.status(400).json({ message: "Can only edit text messages" });
    }

    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populated = await Message.findById(message._id)
      .populate("senderId", "name role profilePicture");

    await emitMessageUpdated(message.threadId.toString(), populated);

    res.json(populated);
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ message: "Failed to edit message" });
  }
};

export const voteOnPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(req.params.id);
    if (!message || message.messageType !== "poll") {
      return res.status(404).json({ message: "Poll not found" });
    }

    message.poll.options.forEach(opt => {
      opt.voters = opt.voters.filter(id => id.toString() !== userId.toString());
    });

    message.poll.options[optionIndex].voters.push(userId);
    await message.save();

    res.json(message);
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ message: "Failed to register vote" });
  }
};

export const flagMessage = async (req, res) => {
  try {
    const { reason } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isFlagged = true;
    message.flagReason = reason;
    await message.save();

    await CommunicationLog.create({
      event: 'flag_raised',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'Message',
      targetId: message._id,
      metadata: { reason },
      outcome: 'success'
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Flag message error:", error);
    res.status(500).json({ message: "Failed to flag message" });
  }
};
