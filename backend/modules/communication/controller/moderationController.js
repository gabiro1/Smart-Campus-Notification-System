import Message from "../model/Message.js";
import UserRestriction from "../model/UserRestriction.js";
import CommunicationLog from "../model/CommunicationLog.js";

export const getFlaggedContent = async (req, res) => {
  try {
    const { type, status = "open", page = 1, limit = 20 } = req.query;
    let query = { isFlagged: true };

    if (type === "message") query = { ...query, moderatedBy: { $exists: false } };
    if (status === "resolved") query = { ...query, moderatedBy: { $ne: null } };
    if (status === "open") query = { ...query, moderatedBy: { $exists: false } };

    const total = await Message.countDocuments(query);
    const flagged = await Message.find(query)
      .populate("senderId", "name role email")
      .populate("moderatedBy", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: flagged,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch flagged content" });
  }
};

export const takeModerationAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.moderationAction = action;
    message.moderatedBy = req.user._id;
    message.moderatedAt = new Date();

    if (action === "removed") {
      message.content = "[Content removed by moderator]";
      message.file = null;
    }

    await message.save();

    if (action === "warning" || action === "remove") {
      const existingRestriction = await UserRestriction.findOne({
        user: message.senderId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });
      if (!existingRestriction) {
        await UserRestriction.create({
          user: message.senderId,
          restrictionType: "message_restricted",
          appliedBy: req.user._id,
          reason: reason || "Moderator action",
          durationHours: 24,
          expiresAt: new Date(Date.now() + 24 * 3600000),
          isActive: true
        });
      }
    }

    await CommunicationLog.create({
      event: 'moderation_action',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'Message',
      targetId: message._id,
      metadata: { action, reason },
      outcome: 'success'
    });

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: "Failed to take moderation action" });
  }
};

export const restrictUser = async (req, res) => {
  try {
    const { userId, restrictionType, durationHours, reason } = req.body;

    const restriction = await UserRestriction.create({
      user: userId,
      restrictionType,
      appliedBy: req.user._id,
      reason: reason || "Administrative restriction",
      durationHours,
      expiresAt: new Date(Date.now() + durationHours * 3600000),
      isActive: true
    });

    await CommunicationLog.create({
      event: 'moderation_action',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'User',
      targetId: userId,
      metadata: { restrictionType, durationHours, reason },
      outcome: 'success'
    });

    res.status(201).json(restriction);
  } catch (error) {
    res.status(500).json({ message: "Failed to restrict user" });
  }
};

export const getRestrictions = async (req, res) => {
  try {
    const restrictions = await UserRestriction.find({ isActive: true })
      .populate("user", "name role email")
      .populate("appliedBy", "name role")
      .sort({ createdAt: -1 });
    res.json(restrictions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch restrictions" });
  }
};

export const liftRestriction = async (req, res) => {
  try {
    const restriction = await UserRestriction.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!restriction) return res.status(404).json({ message: "Restriction not found" });
    res.json(restriction);
  } catch (error) {
    res.status(500).json({ message: "Failed to lift restriction" });
  }
};
