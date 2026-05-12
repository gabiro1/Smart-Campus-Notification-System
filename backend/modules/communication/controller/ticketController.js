import Ticket from "../model/Ticket.js";
import Office from "../model/Office.js";
import OfficeStaff from "../model/OfficeStaff.js";
import ConversationThread from "../model/ConversationThread.js";
import CommunicationLog from "../model/CommunicationLog.js";
import { computeSlaDeadline } from "../utils/slaConfig.js";
import { emitTicketUpdate, notifyUser } from "../services/messageDelivery.js";

export const createTicket = async (req, res) => {
  try {
    const { officeId, subject, description, category, priority = "normal", attachments } = req.body;

    if (!officeId || !subject || !description) {
      return res.status(400).json({ message: "officeId, subject, and description are required" });
    }

    const office = await Office.findById(officeId);
    if (!office) return res.status(404).json({ message: "Office not found" });

    const slaDeadline = computeSlaDeadline(priority);

    const ticket = await Ticket.create({
      submittedBy: req.user._id,
      submitterRole: req.user.role,
      office: officeId,
      subject,
      description,
      category,
      priority,
      slaDeadline,
      status: "new",
      statusHistory: [{
        from: null,
        to: "new",
        changedBy: req.user._id,
        note: "Ticket created"
      }],
      attachments: attachments?.map(a => ({ ...a, uploadedBy: req.user._id })) || []
    });

    await autoAssignTicket(ticket._id, officeId);

    const thread = await ConversationThread.create({
      participants: [req.user._id],
      participantRoles: [{ user: req.user._id, role: req.user.role }],
      threadType: "office_ticket",
      context: { type: "ticket", id: ticket._id, name: subject },
      category: "support",
      office: officeId,
      unreadCount: { [req.user._id.toString()]: 0 }
    });
    ticket.threadId = thread._id;
    await ticket.save();

    await CommunicationLog.create({
      event: 'ticket_created',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'Ticket',
      targetId: ticket._id,
      outcome: 'success'
    });

    const populated = await Ticket.findById(ticket._id)
      .populate("submittedBy", "name role studentID")
      .populate("office", "name code type")
      .populate("assignedTo", "name role");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ message: "Failed to create ticket" });
  }
};

const autoAssignTicket = async (ticketId, officeId) => {
  try {
    const staff = await OfficeStaff.find({ office: officeId, isActive: true, role: "agent" });

    if (staff.length === 0) return;

    const loadMap = {};
    for (const s of staff) {
      const activeCount = await Ticket.countDocuments({
        assignedTo: s.user,
        status: { $in: ["assigned", "in_progress", "awaiting_reply"] }
      });
      loadMap[s.user.toString()] = { staff: s, load: activeCount, maxLoad: s.maxActiveTickets };
    }

    const sorted = Object.values(loadMap)
      .filter(l => l.load < l.maxLoad)
      .sort((a, b) => a.load - b.load || a.staff.specialties.length - b.staff.specialties.length);

    if (sorted.length === 0) return;

    const assigned = sorted[0];
    await Ticket.findByIdAndUpdate(ticketId, {
      assignedTo: assigned.staff.user,
      assignedAt: new Date(),
      status: "assigned",
      $push: { statusHistory: { from: "new", to: "assigned", note: "Auto-assigned" } }
    });

    await notifyUser(assigned.staff.user, "ticket:assigned", { ticketId });
  } catch (err) {
    console.error("Auto-assign error:", err);
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const { status, office, page = 1, limit = 20 } = req.query;
    let query = { submittedBy: req.user._id };
    if (status) query.status = status;
    if (office) query.office = office;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate("office", "name code type")
      .populate("assignedTo", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: tickets,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

export const getAssignedTickets = async (req, res) => {
  try {
    const { status, office, page = 1, limit = 20 } = req.query;
    let query = { assignedTo: req.user._id };
    if (status) query.status = status;
    if (office) query.office = office;

    const tickets = await Ticket.find(query)
      .populate("submittedBy", "name role studentID")
      .populate("office", "name code type")
      .sort({ slaDeadline: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);
    res.json({
      data: tickets,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Get assigned tickets error:", error);
    res.status(500).json({ message: "Failed to fetch assigned tickets" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("submittedBy", "name role studentID email")
      .populate("office", "name code type description")
      .populate("assignedTo", "name role")
      .populate("resolvedBy", "name role")
      .populate("statusHistory.changedBy", "name role")
      .populate("internalNotes.author", "name role");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolution, note } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.statusHistory.push({
      from: oldStatus,
      to: status,
      changedBy: req.user._id,
      note: note || ""
    });

    if (status === "resolved" || status === "closed") {
      ticket.resolution = resolution || ticket.resolution;
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user._id;
      ticket.resolutionTime = (ticket.resolvedAt - ticket.createdAt) / 60000;
    }

    await ticket.save();

    await CommunicationLog.create({
      event: 'ticket_updated',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'Ticket',
      targetId: ticket._id,
      metadata: { from: oldStatus, to: status },
      outcome: 'success'
    });

    await emitTicketUpdate(ticket._id, {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      oldStatus,
      newStatus: status,
      updatedBy: req.user._id
    });

    await notifyUser(ticket.submittedBy, "ticket:status", {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      newStatus: status
    });

    res.json(ticket);
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ message: "Failed to update ticket" });
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.assignedTo = assignedTo;
    ticket.assignedAt = new Date();
    ticket.assignedBy = req.user._id;
    ticket.status = "assigned";
    ticket.statusHistory.push({
      from: ticket.status,
      to: "assigned",
      changedBy: req.user._id,
      note: `Assigned to user`
    });

    const thread = await ConversationThread.findById(ticket.threadId);
    if (thread && assignedTo) {
      const pidStr = assignedTo.toString();
      if (!thread.participants.some(p => p.toString() === pidStr)) {
        thread.participants.push(assignedTo);
        const unreadMap = thread.unreadCount || {};
        unreadMap[pidStr] = 0;
        thread.unreadCount = unreadMap;
        await thread.save();
      }
    }

    await ticket.save();

    if (assignedTo) {
      await notifyUser(assignedTo, "ticket:assigned", {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        priority: ticket.priority
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Assign ticket error:", error);
    res.status(500).json({ message: "Failed to assign ticket" });
  }
};

export const addInternalNote = async (req, res) => {
  try {
    const { content } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.internalNotes.push({ content, author: req.user._id });
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({ message: "Failed to add note" });
  }
};

export const escalateTicket = async (req, res) => {
  try {
    const { reason } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const { createEscalation } = await import("../services/escalationEngine.js");
    const escalation = await createEscalation({
      sourceType: "ticket",
      sourceId: ticket._id,
      initiatedBy: req.user._id,
      reason
    });

    ticket.isEscalated = true;
    ticket.escalationRef = escalation._id;
    ticket.escalatedAt = new Date();
    ticket.status = "assigned";
    ticket.statusHistory.push({
      from: ticket.status,
      to: "assigned",
      changedBy: req.user._id,
      note: `Escalated: ${reason || "No reason provided"}`
    });
    await ticket.save();

    await CommunicationLog.create({
      event: 'escalation_created',
      actor: req.user._id,
      actorRole: req.user.role,
      targetType: 'Ticket',
      targetId: ticket._id,
      metadata: { escalationId: escalation._id, reason },
      outcome: 'success'
    });

    res.json({ ticket, escalation });
  } catch (error) {
    console.error("Escalate ticket error:", error);
    res.status(500).json({ message: "Failed to escalate ticket" });
  }
};

export const rateTicket = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.satisfactionRating = rating;
    ticket.satisfactionFeedback = feedback;
    ticket.satisfactionSubmittedAt = new Date();
    await ticket.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Rate ticket error:", error);
    res.status(500).json({ message: "Failed to submit rating" });
  }
};
