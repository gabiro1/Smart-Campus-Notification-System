import Reminder from "../models/Reminder.js";

/**
 * @desc    Get all reminders for the authenticated student
 * @route   GET /api/reminders
 */
export const getReminders = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // We only fetch reminders belonging to the logged-in user (req.user.id)
    const reminders = await Reminder.find({ studentId: req.user.id })
      .sort({ dueDate: 1 }) // Closest deadlines first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reminder.countDocuments({ studentId: req.user.id });

    res.status(200).json({
      success: true,
      reminders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching tasks", error: error.message });
  }
};

/**
 * @desc    Create a new reminder
 * @route   POST /api/reminders
 */
export const createReminder = async (req, res) => {
  try {
    const { title, note, dueDate, priority, category } = req.body;

    // Basic Validation
    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const reminder = new Reminder({
      studentId: req.user.id, // Linked to the authenticated user
      title,
      note,
      dueDate: new Date(dueDate),
      priority: priority || "Low",
      category: category || "General",
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      reminder,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

/**
 * @desc    Update a reminder (Handles priority shifts and content edits)
 * @route   PUT /api/reminders/:id
 */
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership before updating
    const reminder = await Reminder.findOne({ _id: id, studentId: req.user.id });

    if (!reminder) {
      return res.status(404).json({ message: "Task not found or unauthorized access" });
    }

    // Handle Date conversion if dueDate is being updated
    if (req.body.dueDate) {
      req.body.dueDate = new Date(req.body.dueDate);
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      reminder: updatedReminder,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

/**
 * @desc    Delete a reminder
 * @route   DELETE /api/reminders/:id
 */
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership before deletion
    const reminder = await Reminder.findOne({ _id: id, studentId: req.user.id });

    if (!reminder) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    await Reminder.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task removed from database",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

/**
 * @desc    Mark reminder as complete
 * @route   POST /api/reminders/:id/complete
 */
export const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.id },
      { completed: true },
      { new: true }
    );

    if (!reminder) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Fetch tasks that are currently overdue
 * @route   GET /api/reminders/due
 */
export const getDueReminders = async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      studentId: req.user.id,
      completed: false,
      dueDate: { $lte: now },
    }).sort({ dueDate: 1 });

    res.status(200).json({ count: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};