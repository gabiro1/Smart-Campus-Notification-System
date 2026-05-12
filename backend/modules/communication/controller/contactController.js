import { resolveReachableContacts, getReachableOffices } from "../services/contactResolver.js";
import { verifyRelationship } from "../services/permissionGate.js";
import User from "../../user/model/User.js";
import CommunicationLog from "../model/CommunicationLog.js";

export const getMyContacts = async (req, res) => {
  try {
    const contacts = await resolveReachableContacts(req.user._id);
    await CommunicationLog.create({
      event: 'contact_lookup',
      actor: req.user._id,
      actorRole: req.user.role,
      outcome: 'success'
    });
    res.json(contacts);
  } catch (error) {
    console.error("Contact resolution error:", error);
    res.status(500).json({ message: "Failed to resolve contacts" });
  }
};

export const getMyOffices = async (req, res) => {
  try {
    const offices = await getReachableOffices(req.user);
    res.json(offices);
  } catch (error) {
    console.error("Office lookup error:", error);
    res.status(500).json({ message: "Failed to fetch offices" });
  }
};

export const checkRelationship = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const permission = await verifyRelationship(req.user, targetUser, null);
    res.json({
      canMessage: permission.valid,
      relationshipType: permission.valid ? permission.relationship?.type : null,
      context: permission.context,
      message: permission.valid ? null : "No valid communication relationship found"
    });
  } catch (error) {
    console.error("Relationship check error:", error);
    res.status(500).json({ message: "Failed to check relationship" });
  }
};
