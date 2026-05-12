import Office from "../model/Office.js";
import OfficeStaff from "../model/OfficeStaff.js";
import Ticket from "../model/Ticket.js";

export const getAllOffices = async (req, res) => {
  try {
    const offices = await Office.find({ isActive: true })
      .populate("department", "name code")
      .populate("school", "name")
      .sort({ type: 1, name: 1 });
    res.json(offices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offices" });
  }
};

export const getOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id)
      .populate("department", "name code")
      .populate("school", "name")
      .populate("escalationOffice", "name code");
    if (!office) return res.status(404).json({ message: "Office not found" });
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch office" });
  }
};

export const getOfficeStaff = async (req, res) => {
  try {
    const staff = await OfficeStaff.find({ office: req.params.id, isActive: true })
      .populate("user", "name role profilePicture email")
      .sort({ role: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch office staff" });
  }
};

export const getQueueStatus = async (req, res) => {
  try {
    const officeId = req.params.id;
    const [
      totalTickets,
      openTickets,
      assignedTickets,
      inProgressTickets,
      awaitingReply,
      slaAtRisk,
      avgResolutionTime
    ] = await Promise.all([
      Ticket.countDocuments({ office: officeId }),
      Ticket.countDocuments({ office: officeId, status: "new" }),
      Ticket.countDocuments({ office: officeId, status: "assigned" }),
      Ticket.countDocuments({ office: officeId, status: "in_progress" }),
      Ticket.countDocuments({ office: officeId, status: "awaiting_reply" }),
      Ticket.countDocuments({
        office: officeId,
        status: { $in: ["assigned", "in_progress"] },
        slaDeadline: { $lte: new Date(Date.now() + 2 * 3600000), $gte: new Date() }
      }),
      Ticket.aggregate([
        { $match: { office: Ticket._id?.office || officeId, resolutionTime: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$resolutionTime" } } }
      ])
    ]);

    res.json({
      totalTickets,
      openTickets,
      assignedTickets,
      inProgressTickets,
      awaitingReply,
      slaAtRisk,
      avgResolutionHours: avgResolutionTime[0]?.avg ? (avgResolutionTime[0].avg / 60).toFixed(1) : null
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch queue status" });
  }
};
