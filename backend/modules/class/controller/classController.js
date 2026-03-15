import Class from "../model/Class.js";
import User from "../../user/model/User.js"; 
import Department from "../../department/model/Department.js";

// ==========================================
// 1. HOD / ADMINISTRATIVE FUNCTIONS
// ==========================================

/**
 * @desc    Create a new Class and link to Department
 * @route   POST /api/classes
 */
export const createClass = async (req, res) => {
  try {
    const { name, code, department, lecturers, level, academicYear, semester } = req.body;

    const dept = await Department.findById(department);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const classExists = await Class.findOne({ code, academicYear });
    if (classExists) return res.status(400).json({ message: "Class code already exists for this year" });

    const newClass = await Class.create({
      name, code, department, lecturers, level, academicYear, semester
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all classes with full hierarchy (College -> School -> Dept)
 * @route   GET /api/classes
 */
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate({
        path: 'department',
        select: 'name code',
        populate: {
          path: 'school',
          select: 'name',
          populate: { path: 'college', select: 'name' }
        }
      })
      .populate("lecturers students", "name role profilePicture email");
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

/**
 * @desc    Assign multiple lecturers to a class at once
 */
export const assignLecturers = async (req, res) => {
  try {
    const { classId } = req.params;
    const { lecturerIds } = req.body; 

    const lecturers = await User.find({ _id: { $in: lecturerIds }, role: "lecturer" });
    if (lecturers.length !== lecturerIds.length) {
      return res.status(400).json({ message: "Some IDs are not valid lecturers" });
    }

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

/**
 * @desc    Get all lecturers and their assigned classes for HOD dashboard
 */
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

/**
 * @desc    Assign a specific class to a specific lecturer
 */
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

/**
 * @desc    Remove a specific lecturer from a specific class
 */
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

/**
 * @desc    Update lecturer basic info
 */
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

// ==========================================
// 2. LECTURER DASHBOARD FUNCTIONS
// ==========================================

/**
 * @desc    Get classes assigned to the currently logged-in lecturer
 */
export const getMyClasses = async (req, res) => {
  try {
    const lecturerId = req.user._id; 

    const classes = await Class.find({ lecturers: lecturerId })
      .select("name level code department academicYear")
      .populate('department', 'name code')
      .lean();

    res.status(200).json(classes);
  } catch (error) {
    console.error("Fetch My Classes Error:", error);
    res.status(500).json({ message: "Failed to fetch your assigned classes" });
  }
};