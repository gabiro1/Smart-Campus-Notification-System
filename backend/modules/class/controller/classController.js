import Class from "../model/Class.js";
import User from "../../user/model/User.js";

// ==========================================
// 1. YOUR ORIGINAL FUNCTIONS
// ==========================================

// HoD assigns multiple lecturers to a class at once
export const assignLecturers = async (req, res) => {
  try {
    const { classId } = req.params;
    const { lecturerIds } = req.body; // array of user IDs

    // 1. Validate that all IDs belong to lecturers
    const lecturers = await User.find({ _id: { $in: lecturerIds }, role: "lecturer" });
    if (lecturers.length !== lecturerIds.length) {
      return res.status(400).json({ message: "Some IDs are not valid lecturers" });
    }

    // 2. Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { lecturers: lecturerIds },
      { new: true }
    ).populate("lecturers students", "name role profilePicture");

    res.status(200).json({ message: "Lecturers assigned successfully", class: updatedClass });
  } catch (error) {
    console.error("Assign Lecturers Error:", error);
    res.status(500).json({ message: "Failed to assign lecturers" });
  }
};

// Get classes for dashboard
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("lecturers students", "name role profilePicture");
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};


// ==========================================
// 2. NEW DASHBOARD FUNCTIONS (HOD)
// ==========================================

// Get all lecturers (With their classes attached)
export const getLecturers = async (req, res) => {
  try {
    const lecturers = await User.find({ role: "lecturer" }).lean();

    const classes = await Class.find({ 
      lecturers: { $in: lecturers.map(l => l._id) } 
    }).lean();

    const formattedLecturers = lecturers.map(lecturer => {
      const assignedClasses = classes
        .filter(c => c.lecturers.some(id => id.toString() === lecturer._id.toString()))
        .map(c => ({ 
          id: c._id, 
          name: c.name,
          level: c.level 
        }));

      return {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        phone: lecturer.phone || "N/A",
        assignedClasses
      };
    });

    res.status(200).json(formattedLecturers);
  } catch (error) {
    console.error("Fetch Lecturers Error:", error);
    res.status(500).json({ message: "Failed to fetch lecturers" });
  }
};

// Assign SINGLE lecturer to a class (From the new modal)
export const assignClassToLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { classId } = req.body; 

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { lecturers: lecturerId } }, 
      { new: true }
    );

    if (!updatedClass) return res.status(404).json({ message: "Class not found" });

    res.status(200).json({ message: "Class assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign class" });
  }
};

// Remove SINGLE lecturer from a class
export const removeClassFromLecturer = async (req, res) => {
  try {
    const { lecturerId, classId } = req.params;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $pull: { lecturers: lecturerId } },
      { new: true }
    );

    if (!updatedClass) return res.status(404).json({ message: "Class not found" });

    res.status(200).json({ message: "Class removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove class" });
  }
};

// Update Lecturer Info
export const updateLecturerInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone },
      { new: true }
    );

    res.status(200).json({ message: "Updated successfully", lecturer: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update info" });
  }
};