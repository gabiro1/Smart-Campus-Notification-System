import Reminder from "../models/Reminder.js";

// @desc    Get all reminders for a student
export const getReminders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reminders = await Reminder.find({ studentId: req.user.id })
      .sort({ deadline: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reminder.countDocuments({ studentId: req.user.id });

    res.json({
      reminders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single reminder
export const getReminderDetails = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Ensure user can only view their own reminders
    if (reminder.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new reminder
export const createReminder = async (req, res) => {
  try {
    const { title, description, deadline, priority, category } = req.body;

    // Validate required fields
    if (!title || !deadline) {
      return res.status(400).json({
        message: "Title and deadline are required"
      });
    }

    const reminder = new Reminder({
      studentId: req.user.id,
      title,
      description,
      deadline: new Date(deadline),
      priority: priority || "medium",
      category: category || "general"
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Ensure user can only update their own reminders
    if (reminder.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    if (req.body.title) reminder.title = req.body.title;
    if (req.body.description) reminder.description = req.body.description;
    if (req.body.deadline) reminder.deadline = new Date(req.body.deadline);
    if (req.body.priority) reminder.priority = req.body.priority;
    if (req.body.category) reminder.category = req.body.category;

    await reminder.save();

    res.json({
      success: true,
      message: "Reminder updated successfully",
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Ensure user can only delete their own reminders
    if (reminder.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Reminder deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark reminder as complete
export const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Ensure user can only update their own reminders
    if (reminder.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reminder.completed = true;
    reminder.completedAt = new Date();

    await reminder.save();

    res.json({
      success: true,
      message: "Reminder marked as complete",
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark reminder as incomplete
export const uncompleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Ensure user can only update their own reminders
    if (reminder.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reminder.completed = false;
    reminder.completedAt = null;

    await reminder.save();

    res.json({
      success: true,
      message: "Reminder marked as incomplete",
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all due reminders for a student
export const getDueReminders = async (req, res) => {
  try {
    const now = new Date();

    const reminders = await Reminder.find({
      studentId: req.user.id,
      completed: false,
      deadline: { $lte: now }
    }).sort({ deadline: 1 });

    res.json({
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming reminders for a student (next 7 days)
export const getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      studentId: req.user.id,
      completed: false,
      deadline: {
        $gte: now,
        $lte: sevenDaysLater
      }
    }).sort({ deadline: 1 });

    res.json({
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
