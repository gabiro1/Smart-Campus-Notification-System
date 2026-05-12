import User from "../../user/model/User.js";
import Class from "../../class/model/Class.js";
import Department from "../../department/model/Department.js";
import School from "../../school/model/School.js";
import College from "../../college/model/College.js";
import Escalation from "../model/Escalation.js";
import UserRestriction from "../model/UserRestriction.js";
import { COMMUNICATION_DIRECTION } from "../utils/hierarchyLevels.js";

export const verifyCommunicationPermission = async (sender, receiverId, context = {}) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) return { allowed: false, reason: "RECEIVER_NOT_FOUND" };

  const rules = COMMUNICATION_DIRECTION[sender.role]?.[receiver.role];
  if (!rules) {
    return {
      allowed: false,
      reason: "NO_COMMUNICATION_RULE",
      message: `${sender.role}s cannot directly message ${receiver.role}s.`,
      suggestedMode: "ticket_only",
      alternativeUrl: "/communication/offices"
    };
  }

  if (rules.mode === "direct") {
    if (rules.requires) {
      const relationship = await verifyRelationship(sender, receiver, rules.requires);
      if (!relationship.valid) {
        return {
          allowed: false,
          reason: "NO_RELATIONSHIP",
          message: `You do not have an active ${rules.requires} relationship with this ${receiver.role}.`,
          suggestedMode: rules.mode === "escalation_only" ? "escalation_only" : "ticket_only"
        };
      }
    }
    const restriction = await UserRestriction.findOne({
      user: sender._id,
      restrictionType: { $in: ["message_restricted", "fully_restricted"] },
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    if (restriction) {
      return {
        allowed: false,
        reason: "USER_RESTRICTED",
        message: `Your messaging privileges are restricted. Reason: ${restriction.reason}`,
        expiresAt: restriction.expiresAt
      };
    }

    return { allowed: true, mode: "direct" };
  }

  if (rules.mode === "escalation_only") {
    const activeEscalation = await Escalation.findOne({
      sourceType: "conversation",
      status: "active",
      initiatedBy: sender._id
    }).populate("chain");
    if (activeEscalation) {
      const isInChain = activeEscalation.chain.some(
        c => c.toUser?.toString() === receiverId.toString()
      );
      if (isInChain) {
        return { allowed: true, mode: "escalation", escalation: activeEscalation };
      }
    }
    return {
      allowed: false,
      reason: "ESCALATION_REQUIRED",
      message: `You cannot directly message ${receiver.role}s. Please use the escalation process.`,
      suggestedMode: "escalation_only"
    };
  }

  return {
    allowed: false,
    reason: `COMMUNICATION_MODE_${rules.mode.toUpperCase()}`,
    message: `Communication with ${receiver.role}s requires using the ${rules.mode.replace('_', ' ')} system.`,
    suggestedMode: rules.mode
  };
};

export const verifyRelationship = async (sender, receiver, requirement) => {
  switch (requirement) {
    case "course_enrollment": {
      const sharedClass = await Class.findOne({
        $or: [
          { students: sender._id, lecturers: receiver._id },
          { students: receiver._id, lecturers: sender._id },
          { students: sender._id, students: receiver._id }
        ]
      });
      if (sharedClass) return { valid: true, context: sharedClass };
      return { valid: false };
    }
    case "class_membership": {
      if (sender.classId && receiver.classId && sender.classId.toString() === receiver.classId.toString()) {
        return { valid: true };
      }
      if (receiver.role === "class_rep" && sender.department) {
        const match = receiver.representedDepartment?.toString() === sender.department.toString() &&
          receiver.representedLevel === sender.level;
        return { valid: match };
      }
      return { valid: false };
    }
    case "department": {
      if (sender.department && receiver.department) {
        return { valid: sender.department.toString() === receiver.department.toString() };
      }
      const dept = await Department.findOne({ hod: sender._id });
      if (dept && receiver.department) {
        return { valid: dept._id.toString() === receiver.department.toString() };
      }
      return { valid: false };
    }
    case "school": {
      if (!sender.department || !receiver.department) return { valid: false };
      const [senderDept, receiverDept] = await Promise.all([
        Department.findById(sender.department),
        Department.findById(receiver.department)
      ]);
      if (senderDept?.school && receiverDept?.school) {
        return { valid: senderDept.school.toString() === receiverDept.school.toString() };
      }
      return { valid: false };
    }
    case "college": {
      if (!sender.department || !receiver.department) return { valid: false };
      const [senderDept, receiverDept] = await Promise.all([
        Department.findById(sender.department),
        Department.findById(receiver.department)
      ]);
      if (senderDept?.school && receiverDept?.school) {
        const [senderSchool, receiverSchool] = await Promise.all([
          School.findById(senderDept.school),
          School.findById(receiverDept.school)
        ]);
        if (senderSchool?.college && receiverSchool?.college) {
          return { valid: senderSchool.college.toString() === receiverSchool.college.toString() };
        }
      }
      return { valid: false };
    }
    default:
      return { valid: false };
  }
};

export const canInitiateConversation = async (sender, receiverId) => {
  return verifyCommunicationPermission(sender, receiverId);
};
