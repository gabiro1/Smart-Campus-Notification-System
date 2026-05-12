import Escalation from "../model/Escalation.js";
import { escalateToNextLevel, resolveEscalation } from "../services/escalationEngine.js";
import { notifyUser } from "../services/messageDelivery.js";

export const getMyEscalations = async (req, res) => {
  try {
    const { status = "active", page = 1, limit = 20 } = req.query;
    const query = {
      $or: [
        { initiatedBy: req.user._id },
        { "chain.toUser": req.user._id }
      ]
    };
    if (status !== "all") query.status = status;

    const total = await Escalation.countDocuments(query);
    const escalations = await Escalation.find(query)
      .populate("initiatedBy", "name role")
      .populate("chain.fromUser", "name role")
      .populate("chain.toUser", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: escalations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Get escalations error:", error);
    res.status(500).json({ message: "Failed to fetch escalations" });
  }
};

export const getEscalation = async (req, res) => {
  try {
    const escalation = await Escalation.findById(req.params.id)
      .populate("initiatedBy", "name role")
      .populate("chain.fromUser", "name role")
      .populate("chain.toUser", "name role")
      .populate("resolvedBy", "name role");
    if (!escalation) return res.status(404).json({ message: "Escalation not found" });
    res.json(escalation);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch escalation" });
  }
};

export const resolveEscalationHandler = async (req, res) => {
  try {
    const { resolution } = req.body;
    const escalation = await resolveEscalation(req.params.id, resolution, req.user._id);
    if (!escalation) return res.status(404).json({ message: "Escalation not found" });

    await notifyUser(escalation.initiatedBy, "escalation:resolved", {
      escalationId: escalation._id,
      escalationNumber: escalation.escalationNumber
    });

    res.json(escalation);
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve escalation" });
  }
};

export const forceEscalate = async (req, res) => {
  try {
    const { note } = req.body;
    const escalation = await Escalation.findById(req.params.id);
    if (!escalation) return res.status(404).json({ message: "Escalation not found" });
    if (escalation.status !== "active") return res.status(400).json({ message: "Escalation is not active" });

    const updated = await escalateToNextLevel(escalation._id);
    if (!updated) return res.status(400).json({ message: "Cannot escalate further" });

    if (updated.status !== "max_level_reached" && updated.chain.length > 0) {
      const lastStep = updated.chain[updated.chain.length - 1];
      if (lastStep.toUser) {
        await notifyUser(lastStep.toUser, "escalation:new", {
          escalationId: updated._id,
          escalationNumber: updated.escalationNumber,
          level: updated.currentLevel
        });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to escalate" });
  }
};
