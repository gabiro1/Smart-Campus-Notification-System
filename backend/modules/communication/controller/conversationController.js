import ConversationThread from "../model/ConversationThread.js";
import Message from "../model/Message.js";
import CommunicationLog from "../model/CommunicationLog.js";
import { canInitiateConversation } from "../services/permissionGate.js";
import { resolveContext } from "../services/contextResolver.js";
import { emitThreadUpdate } from "../services/messageDelivery.js";

export const getConversations = async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    let query = { participants: userId, isArchived: false };
    if (type) query.threadType = type;
    if (status === "unread") {
      query[`unreadCount.${userId.toString()}`] = { $gt: 0 };
    }
    if (search) {
      query["context.name"] = { $regex: search, $options: "i" };
    }

    const total = await ConversationThread.countDocuments(query);
    const conversations = await ConversationThread.find(query)
      .populate("participants", "name role profilePicture department")
      .populate("lastMessage")
      .populate("office", "name code type")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: conversations.map(c => {
        const obj = c.toObject();
        obj.myUnreadCount = c.unreadCount?.get(userId.toString()) || 0;
        return obj;
      }),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { participants, threadType, context, subject } = req.body;
    const userId = req.user._id;

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: "At least one participant required" });
    }

    const allParticipants = [userId.toString(), ...participants.map(p => p.toString())];
    const uniqueParticipants = [...new Set(allParticipants)];

    if (uniqueParticipants.length < 2) {
      return res.status(400).json({ message: "Conversation needs at least 2 unique participants" });
    }

    if (threadType !== "office_ticket" && threadType !== "escalation") {
      for (const pId of participants) {
        const targetUser = await (await import("../../user/model/User.js")).default.findById(pId);
        if (targetUser) {
          const permission = await canInitiateConversation(req.user, targetUser);
          if (!permission.allowed) {
            return res.status(403).json({
              message: permission.message || `Cannot message this user`,
              suggestedMode: permission.suggestedMode,
              alternativeUrl: permission.alternativeUrl
            });
          }
        }
      }
    }

    let resolvedContext = null;
    if (context?.type && context?.id) {
      resolvedContext = await resolveContext(context.type, context.id, req.user);
    }

    const thread = await ConversationThread.create({
      participants: uniqueParticipants,
      participantRoles: uniqueParticipants.map(pid => ({
        user: pid,
        role: pid === userId.toString() ? req.user.role : null
      })),
      threadType: threadType || resolvedContext?.threadType || "direct",
      context: resolvedContext?.context || context || { type: "general" },
      category: resolvedContext?.category || "general",
      office: resolvedContext?.office || null,
      unreadCount: Object.fromEntries(uniqueParticipants.map(p => [p, 0]))
    });

    await CommunicationLog.create({
      event: 'conversation_created',
      actor: userId,
      actorRole: req.user.role,
      targetType: 'ConversationThread',
      targetId: thread._id,
      outcome: 'success'
    });

    const populated = await ConversationThread.findById(thread._id)
      .populate("participants", "name role profilePicture department")
      .populate("office", "name code type");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const thread = await ConversationThread.findById(req.params.id)
      .populate("participants", "name role profilePicture department")
      .populate("lastMessage")
      .populate("office", "name code type");

    if (!thread) return res.status(404).json({ message: "Conversation not found" });
    if (!thread.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant of this conversation" });
    }

    const obj = thread.toObject();
    obj.myUnreadCount = thread.unreadCount?.get(req.user._id.toString()) || 0;
    res.json(obj);
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { isArchived, urgency, category, isMuted } = req.body;
    const thread = await ConversationThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Conversation not found" });

    const isParticipant = thread.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: "Not a participant" });

    if (isArchived !== undefined) {
      thread.isArchived = isArchived;
      thread.archivedAt = isArchived ? new Date() : null;
    }
    if (urgency) thread.urgency = urgency;
    if (category) thread.category = category;
    if (isMuted !== undefined) thread.isMuted = isMuted;

    await thread.save();
    await emitThreadUpdate(thread._id, { isArchived, urgency, category, isMuted });

    res.json(thread);
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({ message: "Failed to update conversation" });
  }
};

export const getUnreadSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const threads = await ConversationThread.find({
      participants: userId,
      isArchived: false
    }).select("threadType unreadCount");

    const summary = { total: 0, academic: 0, administrative: 0, support: 0, requests: 0, escalations: 0 };

    for (const t of threads) {
      const count = t.unreadCount?.get(userId.toString()) || 0;
      if (count === 0) continue;
      summary.total += count;
      if (t.threadType === "course_discussion" || t.threadType === "direct") summary.academic += count;
      else if (t.threadType === "office_ticket") summary.support += count;
      else if (t.threadType === "structured_request") summary.requests += count;
      else if (t.threadType === "escalation") summary.escalations += count;
      else summary.administrative += count;
    }

    res.json(summary);
  } catch (error) {
    console.error("Unread summary error:", error);
    res.status(500).json({ message: "Failed to fetch unread summary" });
  }
};

export const searchConversations = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ conversations: [], tickets: [], requests: [] });

    const userId = req.user._id;

    const conversations = await ConversationThread.find({
      participants: userId,
      $or: [
        { "context.name": { $regex: q, $options: "i" } },
        { threadType: { $regex: q, $options: "i" } }
      ]
    })
      .populate("participants", "name role")
      .limit(10);

    const Message = (await import("../model/Message.js")).default;
    const threadIds = conversations.map(c => c._id);
    const messages = await Message.find({
      threadId: { $in: threadIds },
      content: { $regex: q, $options: "i" }
    })
      .populate("senderId", "name role")
      .limit(20);

    res.json({ conversations, messages });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};
