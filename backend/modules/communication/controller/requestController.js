import StructuredRequest from "../model/StructuredRequest.js";
import RequestTemplate from "../model/RequestTemplate.js";
import Office from "../model/Office.js";
import ConversationThread from "../model/ConversationThread.js";
import CommunicationLog from "../model/CommunicationLog.js";
import { REQUEST_TEMPLATES } from "../utils/requestTemplates.js";

export const getTemplates = async (req, res) => {
  const templates = Object.entries(REQUEST_TEMPLATES).map(([key, t]) => ({
    requestType: key,
    name: t.name,
    description: t.description,
    formFields: t.formFields,
    approvalRequired: t.approvalRequired,
    targetOfficeCode: t.targetOfficeCode
  }));
  res.json(templates);
};

export const submitRequest = async (req, res) => {
  try {
    const { requestType, formData, attachments } = req.body;

    if (!requestType || !formData) {
      return res.status(400).json({ message: "requestType and formData are required" });
    }

    const templateDef = REQUEST_TEMPLATES[requestType];
    if (!templateDef) return res.status(400).json({ message: "Invalid request type" });

    let targetOffice = null;
    if (templateDef.targetOfficeCode) {
      targetOffice = await Office.findOne({ code: templateDef.targetOfficeCode });
    }

    const request = await StructuredRequest.create({
      requestType,
      submittedBy: req.user._id,
      submitterInfo: {
        name: req.user.name,
        studentId: req.user.studentID,
        email: req.user.email,
        department: req.user.department?.toString(),
        level: req.user.level
      },
      formData,
      targetOffice: targetOffice?._id,
      targetRole: templateDef.targetRole,
      statusHistory: [{
        from: null,
        to: "submitted",
        changedBy: req.user._id,
        comment: "Request submitted"
      }],
      attachments: attachments || []
    });

    const thread = await ConversationThread.create({
      participants: [req.user._id],
      participantRoles: [{ user: req.user._id, role: req.user.role }],
      threadType: "structured_request",
      context: { type: "request", id: request._id, name: requestType },
      category: "administrative",
      unreadCount: { [req.user._id.toString()]: 0 }
    });
    request.threadId = thread._id;
    await request.save();

    await CommunicationLog.create({
      event: 'request_submitted',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'StructuredRequest',
      targetId: request._id,
      metadata: { requestType },
      outcome: 'success'
    });

    const populated = await StructuredRequest.findById(request._id)
      .populate("submittedBy", "name role studentID")
      .populate("targetOffice", "name code");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Submit request error:", error);
    res.status(500).json({ message: "Failed to submit request" });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    let query = { submittedBy: req.user._id };
    if (status) query.status = status;
    if (type) query.requestType = type;

    const total = await StructuredRequest.countDocuments(query);
    const requests = await StructuredRequest.find(query)
      .populate("targetOffice", "name code")
      .populate("approvedBy", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: requests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

export const getRequest = async (req, res) => {
  try {
    const request = await StructuredRequest.findById(req.params.id)
      .populate("submittedBy", "name role studentID email")
      .populate("targetOffice", "name code")
      .populate("approvedBy", "name role");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch request" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const request = await StructuredRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const oldStatus = request.status;
    request.status = status;
    request.statusHistory.push({
      from: oldStatus,
      to: status,
      changedBy: req.user._id,
      comment: comment || ""
    });

    if (status === "approved") {
      request.approvedBy = req.user._id;
      request.approvedAt = new Date();
    }
    if (status === "rejected") {
      request.rejectionReason = comment || "";
    }

    await request.save();

    await CommunicationLog.create({
      event: status === "approved" ? 'request_approved' : 'request_rejected',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'StructuredRequest',
      targetId: request._id,
      metadata: { from: oldStatus, to: status },
      outcome: 'success'
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to update request status" });
  }
};

export const escalateRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await StructuredRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const { createEscalation } = await import("../services/escalationEngine.js");
    const escalation = await createEscalation({
      sourceType: "request",
      sourceId: request._id,
      initiatedBy: req.user._id,
      reason
    });

    request.isEscalated = true;
    request.escalationRef = escalation._id;
    await request.save();

    res.json({ request, escalation });
  } catch (error) {
    res.status(500).json({ message: "Failed to escalate request" });
  }
};
