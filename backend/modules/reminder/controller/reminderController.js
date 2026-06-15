import mongoose from "mongoose";
import Reminder from "../model/Reminder.js";
import ReminderRecipient from "../model/ReminderRecipient.js";
import ReminderPreference from "../model/ReminderPreference.js";
import { scheduleReminderJob, cancelReminderJob, rescheduleReminderJob } from "../../../services/reminderScheduler.js";

// ==========================================
// 1. CRUD — REMINDERS
// ==========================================

export const getReminders = async (req, res) => {
  try {
    const {
      page = 1, limit = 50, status, sourceType, priority,
      completed, startDate, endDate, search, sort = "scheduledTime"
    } = req.query;
    const skip = (page - 1) * limit;
    const query = { createdBy: req.user._id };

    if (status) query.status = status;
    if (sourceType) query.sourceType = sourceType;
    if (priority) query.priority = priority;
    if (completed !== undefined) query.completed = completed === "true";
    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) query.scheduledTime.$gte = new Date(startDate);
      if (endDate) query.scheduledTime.$lte = new Date(endDate);
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } }
      ];
    }

    const sortOption = {};
    sortOption[sort] = sort.startsWith('-') ? -1 : 1;

    const reminders = await Reminder.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Reminder.countDocuments(query);

    res.status(200).json({
      success: true,
      reminders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reminders", error: error.message });
  }
};

export const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, createdBy: req.user._id }).lean();
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }
    res.status(200).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reminder", error: error.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const {
      title, description, sourceType, sourceId, priority,
      scheduledTime, dueDate, isRecurring, recurrencePattern, recurrenceEnd,
      deliveryChannels, targetAudience, targetId
    } = req.body;

    if (!title || !scheduledTime) {
      return res.status(400).json({ success: false, message: "Title and scheduled time are required" });
    }

    if (sourceId && sourceType !== "personal") {
      const existing = await Reminder.findOne({
        createdBy: req.user._id,
        sourceType,
        sourceId: new mongoose.Types.ObjectId(sourceId),
        status: { $nin: ["cancelled"] }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A reminder for this item already exists",
          existingReminderId: existing._id
        });
      }
    }

    const reminder = new Reminder({
      title,
      description,
      sourceType: sourceType || "personal",
      sourceId: sourceId ? new mongoose.Types.ObjectId(sourceId) : null,
      priority: priority || "medium",
      scheduledTime: new Date(scheduledTime),
      dueDate: dueDate ? new Date(dueDate) : null,
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
      deliveryChannels: {
        inApp: true,
        push: deliveryChannels?.push !== false,
        email: deliveryChannels?.email || false,
        sms: deliveryChannels?.sms || false
      },
      targetAudience: targetAudience || "self",
      targetId: targetId ? new mongoose.Types.ObjectId(targetId) : null,
      createdBy: req.user._id,
      status: "scheduled"
    });

    await reminder.save();

    await scheduleReminderJob(reminder._id);

    res.status(201).json({
      success: true,
      message: "Reminder created and scheduled",
      reminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create reminder", error: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOne({ _id: id, createdBy: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    const updatableFields = [
      "title", "description", "priority", "dueDate", "isRecurring",
      "recurrencePattern", "recurrenceEnd", "deliveryChannels",
      "targetAudience", "targetId", "completed"
    ];

    let statusChanged = false;
    let timeChanged = false;

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        if (field === "dueDate" && req.body[field]) {
          reminder[field] = new Date(req.body[field]);
        } else if (field === "targetId" && req.body[field]) {
          reminder[field] = new mongoose.Types.ObjectId(req.body[field]);
        } else {
          reminder[field] = req.body[field];
        }
      }
    }

    if (req.body.scheduledTime) {
      reminder.scheduledTime = new Date(req.body.scheduledTime);
      timeChanged = true;
    }

    if (req.body.status === "cancelled") {
      reminder.status = "cancelled";
      reminder.cancelledBy = req.user._id;
      reminder.cancelledAt = new Date();
      statusChanged = true;
    } else if (req.body.status === "pending") {
      reminder.status = "pending";
      statusChanged = true;
    } else if (req.body.status === "scheduled" && reminder.status !== "scheduled") {
      reminder.status = "scheduled";
      statusChanged = true;
    }

    if (req.body.completed === true) {
      reminder.completed = true;
      reminder.completedAt = new Date();
    } else if (req.body.completed === false) {
      reminder.completed = false;
      reminder.completedAt = null;
    }

    reminder.updatedBy = req.user._id;

    await reminder.save();

    if (statusChanged && reminder.status === "cancelled") {
      await cancelReminderJob(id);
    } else if (statusChanged && reminder.status === "scheduled") {
      await scheduleReminderJob(id);
    } else if (timeChanged && reminder.status === "scheduled") {
      await rescheduleReminderJob(id);
    }

    res.status(200).json({
      success: true,
      message: "Reminder updated",
      reminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update reminder", error: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOne({ _id: id, createdBy: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    await cancelReminderJob(id);
    await ReminderRecipient.deleteMany({ reminderId: id });
    await Reminder.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete reminder", error: error.message });
  }
};

// ==========================================
// 2. STATUS TRANSITIONS
// ==========================================

export const cancelReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOne({ _id: id, createdBy: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    if (["sent", "cancelled"].includes(reminder.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel reminder with status: ${reminder.status}` });
    }

    await cancelReminderJob(id);

    reminder.status = "cancelled";
    reminder.cancelledBy = req.user._id;
    reminder.cancelledAt = new Date();
    reminder.cancellationReason = reason || null;
    await reminder.save();

    res.status(200).json({ success: true, message: "Reminder cancelled", reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel reminder", error: error.message });
  }
};

export const completeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { completed: true, completedAt: new Date(), updatedBy: req.user._id },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.status(200).json({ success: true, message: "Reminder marked complete", reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to complete reminder", error: error.message });
  }
};

export const uncompleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { completed: false, completedAt: null, updatedBy: req.user._id },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.status(200).json({ success: true, message: "Reminder marked incomplete", reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to uncomplete reminder", error: error.message });
  }
};

// ==========================================
// 3. BULK OPERATIONS
// ==========================================

export const bulkCompleteReminders = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Array of reminder IDs required" });
    }

    const result = await Reminder.updateMany(
      { _id: { $in: ids }, createdBy: req.user._id },
      { completed: true, completedAt: new Date(), updatedBy: req.user._id }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} reminders completed`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk complete failed", error: error.message });
  }
};

export const bulkDeleteReminders = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Array of reminder IDs required" });
    }

    for (const id of ids) {
      await cancelReminderJob(id);
    }

    await ReminderRecipient.deleteMany({ reminderId: { $in: ids } });
    const result = await Reminder.deleteMany({ _id: { $in: ids }, createdBy: req.user._id });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} reminders deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk delete failed", error: error.message });
  }
};

// ==========================================
// 4. REMINDER PREFERENCES
// ==========================================

export const getReminderPreferences = async (req, res) => {
  try {
    let prefs = await ReminderPreference.findOne({ userId: req.user._id });
    if (!prefs) {
      prefs = await ReminderPreference.create({ userId: req.user._id });
    }
    res.status(200).json({ success: true, preferences: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch preferences", error: error.message });
  }
};

export const updateReminderPreferences = async (req, res) => {
  try {
    const prefs = await ReminderPreference.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: "Preferences updated", preferences: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update preferences", error: error.message });
  }
};

// ==========================================
// 5. DUE & OVERDUE REMINDERS
// ==========================================

export const getDueReminders = async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      createdBy: req.user._id,
      status: { $in: ["scheduled", "pending"] },
      scheduledTime: { $lte: now },
      completed: false
    }).sort({ scheduledTime: 1 }).lean();

    res.status(200).json({ success: true, count: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch due reminders", error: error.message });
  }
};

export const getReminderTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 86400000);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
    const startOfTomorrow = new Date(endOfDay.getTime());
    const endOfTomorrow = new Date(startOfTomorrow.getTime() + 86400000);

    const baseQuery = { createdBy: userId, completed: false };

    const [today, tomorrow, thisWeek, upcoming, overdue, completedRecently] = await Promise.all([
      Reminder.find({ ...baseQuery, scheduledTime: { $gte: startOfDay, $lt: endOfDay } }).sort({ scheduledTime: 1 }).lean(),
      Reminder.find({ ...baseQuery, scheduledTime: { $gte: startOfTomorrow, $lt: endOfTomorrow } }).sort({ scheduledTime: 1 }).lean(),
      Reminder.find({ ...baseQuery, scheduledTime: { $gte: endOfTomorrow, $lt: endOfWeek } }).sort({ scheduledTime: 1 }).lean(),
      Reminder.find({ ...baseQuery, scheduledTime: { $gte: endOfWeek } }).sort({ scheduledTime: 1 }).limit(20).lean(),
      Reminder.find({ createdBy: userId, completed: false, scheduledTime: { $lt: startOfDay }, status: { $ne: "cancelled" } }).sort({ scheduledTime: 1 }).lean(),
      Reminder.find({ createdBy: userId, completed: true, completedAt: { $gte: new Date(now.getTime() - 7 * 86400000) } }).sort({ completedAt: -1 }).limit(20).lean()
    ]);

    res.status(200).json({
      success: true,
      timeline: { today, tomorrow, thisWeek, upcoming, overdue, completed: completedRecently }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch timeline", error: error.message });
  }
};

// ==========================================
// 6. RECIPIENT TRACKING
// ==========================================

export const getReminderRecipients = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid reminder ID" });
    }

    const reminder = await Reminder.findOne({ _id: id, createdBy: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    const recipients = await ReminderRecipient.find({ reminderId: id })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, recipients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch recipients", error: error.message });
  }
};

// ==========================================
// 7. ANALYTICS
// ==========================================

export const getReminderStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      total, scheduled, sent, failed, cancelled,
      completed, overdue, bySourceType, byPriority
    ] = await Promise.all([
      Reminder.countDocuments({ createdBy: userId }),
      Reminder.countDocuments({ createdBy: userId, status: "scheduled" }),
      Reminder.countDocuments({ createdBy: userId, status: "sent" }),
      Reminder.countDocuments({ createdBy: userId, status: "failed" }),
      Reminder.countDocuments({ createdBy: userId, status: "cancelled" }),
      Reminder.countDocuments({ createdBy: userId, completed: true }),
      Reminder.countDocuments({ createdBy: userId, completed: false, scheduledTime: { $lt: new Date() }, status: { $ne: "cancelled" } }),
      Reminder.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$sourceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Reminder.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total, scheduled, sent, failed, cancelled,
        completed, overdue,
        bySourceType: Object.fromEntries(bySourceType.map(s => [s._id, s.count])),
        byPriority: Object.fromEntries(byPriority.map(p => [p._id, p.count]))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats", error: error.message });
  }
};
