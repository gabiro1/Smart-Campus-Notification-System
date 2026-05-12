import Escalation from "../model/Escalation.js";
import Ticket from "../model/Ticket.js";
import StructuredRequest from "../model/StructuredRequest.js";
import User from "../../user/model/User.js";
import Department from "../../department/model/Department.js";
import School from "../../school/model/School.js";
import College from "../../college/model/College.js";
import { ESCALATION_CHAINS } from "../utils/slaConfig.js";

export const createEscalation = async ({ sourceType, sourceId, initiatedBy, reason }) => {
  let sourceDoc;
  let chainDef;

  if (sourceType === "ticket") {
    sourceDoc = await Ticket.findById(sourceId).populate("office");
    chainDef = ESCALATION_CHAINS.ticket_general;
  } else if (sourceType === "request") {
    sourceDoc = await StructuredRequest.findById(sourceId);
    chainDef = ESCALATION_CHAINS[sourceDoc?.requestType] || ESCALATION_CHAINS.ticket_general;
  } else {
    chainDef = ESCALATION_CHAINS.ticket_general;
  }

  const firstLevel = chainDef.levels[0];
  const firstApprover = await findApproverByRole(firstLevel.role, sourceDoc);

  const escalation = await Escalation.create({
    sourceType,
    sourceId,
    initiatedBy,
    currentLevel: 1,
    maxLevel: chainDef.levels.length,
    timeoutHours: firstLevel.timeoutHours,
    timeoutAt: firstLevel.timeoutHours > 0
      ? new Date(Date.now() + firstLevel.timeoutHours * 3600000)
      : null,
    chain: [{
      fromLevel: 0,
      fromUser: initiatedBy,
      toLevel: 1,
      toUser: firstApprover?._id,
      toRole: firstLevel.role,
      reason: reason || "Initial escalation",
      status: "pending"
    }]
  });

  return escalation;
};

export const escalateToNextLevel = async (escalationId) => {
  const escalation = await Escalation.findById(escalationId);
  if (!escalation || escalation.status !== "active") return null;

  const chainDef = findChainDef(escalation);
  const nextLevel = escalation.currentLevel + 1;

  if (nextLevel > escalation.maxLevel) {
    escalation.status = "max_level_reached";
    await escalation.save();
    return escalation;
  }

  const levelDef = chainDef.levels.find(l => l.level === nextLevel);
  const nextApprover = await findApproverByRole(levelDef.role, null, escalation);

  escalation.chain.push({
    fromLevel: escalation.currentLevel,
    toLevel: nextLevel,
    toUser: nextApprover?._id,
    toRole: levelDef.role,
    reason: "Auto-escalation: timeout expired",
    escalatedAt: new Date(),
    status: "pending"
  });

  escalation.currentLevel = nextLevel;
  escalation.timeoutAt = levelDef.timeoutHours > 0
    ? new Date(Date.now() + levelDef.timeoutHours * 3600000)
    : null;

  await escalation.save();

  if (escalation.sourceType === "ticket") {
    await Ticket.findByIdAndUpdate(escalation.sourceId, {
      isEscalated: true,
      escalationRef: escalation._id,
      escalatedAt: new Date()
    });
  }

  return escalation;
};

const findChainDef = (escalation) => {
  if (escalation.sourceType === "ticket") return ESCALATION_CHAINS.ticket_general;
  return ESCALATION_CHAINS.ticket_general;
};

const findApproverByRole = async (role, sourceDoc, escalation) => {
  if (role === "office_agent" || role === "office_manager") {
    return null;
  }

  if (role === "lecturer") {
    const ticket = sourceDoc || (escalation && await Ticket.findById(escalation.sourceId));
    if (ticket) {
      return ticket.assignedTo || null;
    }
  }

  if (role === "hod") {
    let deptId;
    if (sourceDoc?.submittedBy) {
      const submitter = await User.findById(sourceDoc.submittedBy);
      deptId = submitter?.department;
    }
    if (deptId) {
      const dept = await Department.findById(deptId).populate("hod");
      return dept?.hod || null;
    }
  }

  if (role === "dean") {
    let schoolId;
    if (sourceDoc?.submittedBy) {
      const submitter = await User.findById(sourceDoc.submittedBy);
      if (submitter?.department) {
        const dept = await Department.findById(submitter.department);
        schoolId = dept?.school;
      }
    }
    if (schoolId) {
      const school = await School.findById(schoolId).populate("dean");
      return school?.dean || null;
    }
  }

  if (role === "principal") {
    let collegeId;
    if (sourceDoc?.submittedBy) {
      const submitter = await User.findById(sourceDoc.submittedBy);
      if (submitter?.department) {
        const dept = await Department.findById(submitter.department);
        if (dept?.school) {
          const school = await School.findById(dept.school);
          collegeId = school?.college;
        }
      }
    }
    if (collegeId) {
      const college = await College.findById(collegeId).populate("principal");
      return college?.principal || null;
    }
  }

  const user = await User.findOne({ role }).select("_id name role");
  return user || null;
};

export const resolveEscalation = async (escalationId, resolution, resolvedBy) => {
  const escalation = await Escalation.findById(escalationId);
  if (!escalation) return null;

  escalation.status = "resolved";
  escalation.resolution = resolution;
  escalation.resolvedAt = new Date();
  escalation.resolvedBy = resolvedBy;

  const currentChain = escalation.chain[escalation.chain.length - 1];
  if (currentChain) {
    currentChain.status = "resolved";
    currentChain.resolvedAt = new Date();
    currentChain.note = resolution;
  }

  await escalation.save();

  if (escalation.sourceType === "ticket") {
    await Ticket.findByIdAndUpdate(escalation.sourceId, {
      isEscalated: false,
      status: "resolved",
      resolution,
      resolvedAt: new Date(),
      resolvedBy
    });
  }

  return escalation;
};
