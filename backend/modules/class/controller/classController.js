import Class from "../model/Class.js";
import User from "../../user/model/User.js"; 
import Department from "../../department/model/Department.js";
import School from "../../school/model/School.js";
import College from "../../college/model/College.js";

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

    // Validate department exists
    const dept = await Department.findById(department);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    // Prevent duplicate classes in the same academic year
    const classExists = await Class.findOne({ code, academicYear });
    if (classExists) return res.status(400).json({ message: "Class code already exists for this academic year." });

    const newClass = await Class.create({
      name, code, department, lecturers, level, academicYear, semester
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Create Class Error:", error);
    res.status(500).json({ message: "Server Error: Failed to create class." });
  }
};

/**
 * @desc    Get all classes
 * @route   GET /api/classes
 */
export const getClasses = async (req, res) => {
  try {
    const { includeStudents } = req.query;
    
    let query = Class.find()
      .populate({
        path: 'department',
        select: 'name code',
        populate: {
          path: 'school',
          select: 'name',
          populate: { path: 'college', select: 'name' }
        }
      })
      .populate("lecturers", "name role profilePicture email")
      .select("-__v");
    
    // Only populate students when explicitly requested (for admin dashboard)
    if (includeStudents === 'true') {
      query = query.populate("students", "name email role");
    }
      
    const classes = await query;
    res.status(200).json(classes);
  } catch (error) {
    console.error("Get Classes Error:", error);
    res.status(500).json({ message: "Failed to fetch classes." });
  }
};

/**
 * @desc    Assign multiple lecturers to a class at once
 * @route   PUT /api/classes/:classId/assign-multiple
 */
export const assignLecturers = async (req, res) => {
  try {
    const { classId } = req.params;
    const { lecturerIds } = req.body; 

    // Verify all IDs actually belong to lecturers
    const lecturers = await User.find({ _id: { $in: lecturerIds }, role: "lecturer" });
    if (lecturers.length !== lecturerIds.length) {
      return res.status(400).json({ message: "One or more IDs do not belong to valid lecturers." });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { lecturers: lecturerIds },
      { new: true }
    ).populate("lecturers", "name role profilePicture");

    if (!updatedClass) return res.status(404).json({ message: "Class not found." });

    res.status(200).json({ message: "Lecturers assigned successfully", class: updatedClass });
  } catch (error) {
    console.error("Assign Lecturers Error:", error);
    res.status(500).json({ message: "Failed to bulk assign lecturers." });
  }
};

/**
 * @desc    Get all lecturers and their assigned classes for HOD dashboard
 * @route   GET /api/classes/lecturers
 */
export const getLecturers = async (req, res) => {
  try {
    // 1. Get the logged-in HOD's department ID from the auth token
    const hodDepartmentId = req.user.department; 

    if (!hodDepartmentId) {
      return res.status(403).json({ message: "Access denied. HOD is not assigned to a department." });
    }

    // 2. SECURE QUERY: Find ONLY lecturers in the HOD's specific department
    const lecturers = await User.find({ 
      role: "lecturer", 
      department: hodDepartmentId 
    }).select("-password").lean();
    
    // 3. Find classes assigned to these specific lecturers
    const classes = await Class.find({ 
      lecturers: { $in: lecturers.map(l => l._id) } 
    }).lean();

    const formattedLecturers = lecturers.map(lecturer => {
      const assignedClasses = classes
        .filter(c => c.lecturers.some(id => id.toString() === lecturer._id.toString()))
        .map(c => ({ 
          id: c._id, 
          name: c.name,
          level: c.level,
          code: c.code
        }));

      return {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        // SCHEMA FIX: Your User schema uses 'phoneNumber', not 'phone'
        phone: lecturer.phoneNumber || "N/A", 
        assignedClasses
      };
    });

    res.status(200).json(formattedLecturers);
  } catch (error) {
    console.error("Fetch Lecturers Error:", error);
    res.status(500).json({ message: "Failed to fetch lecturers." });
  }
};

/**
 * @desc    Assign a specific class to a specific lecturer
 * @route   POST /api/classes/assign/:lecturerId
 */
export const assignClassToLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { classId } = req.body; 

    // $addToSet prevents duplicate lecturer IDs in the array
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { lecturers: lecturerId } }, 
      { new: true }
    );

    if (!updatedClass) return res.status(404).json({ message: "Class not found" });
    res.status(200).json({ message: "Class assigned successfully" });
  } catch (error) {
    console.error("Assign Class Error:", error);
    res.status(500).json({ message: "Failed to assign class." });
  }
};

/**
 * @desc    Remove a specific lecturer from a specific class
 * @route   DELETE /api/classes/remove/:lecturerId/:classId
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
    console.error("Remove Class Error:", error);
    res.status(500).json({ message: "Failed to remove class." });
  }
};

/**
 * @desc    Update lecturer basic info
 * @route   PUT /api/classes/lecturer/:id
 */
export const updateLecturerInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "Lecturer not found" });

    res.status(200).json({ message: "Updated successfully", lecturer: updatedUser });
  } catch (error) {
    console.error("Update Info Error:", error);
    res.status(500).json({ message: "Failed to update lecturer info." });
  }
};


// ==========================================
// 2. LECTURER DASHBOARD FUNCTIONS
// ==========================================

/**
 * @desc    Get classes assigned to the currently logged-in lecturer
 * @route   GET /api/classes/my-classes
 */
export const getMyClasses = async (req, res) => {
  try {
    // Ensure your auth middleware attaches the user to the request!
    const lecturerId = req.user._id; 

    const classes = await Class.find({ lecturers: lecturerId })
      .select("name level code department academicYear students")
      .populate('department', 'name code')
      .lean();

    // Map through to count students securely without sending the whole array
    const formattedClasses = classes.map(cls => ({
      ...cls,
      studentCount: cls.students ? cls.students.length : 0,
      students: undefined // Clean up the payload
    }));

    res.status(200).json(formattedClasses);
  } catch (error) {
    console.error("Fetch My Classes Error:", error);
    res.status(500).json({ message: "Failed to fetch your assigned classes." });
  }
};

/**
 * @desc    Get specific student roster for a class (Security checked)
 * @route   GET /api/classes/:classId/students
 */
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const lecturerId = req.user._id;

    // Security: Validate that this lecturer actually teaches this class
    const targetClass = await Class.findOne({ _id: classId, lecturers: lecturerId })
      .select("name code students")
      .populate("students", "name email profilePicture"); 

    if (!targetClass) {
      return res.status(403).json({ message: "You are not authorized to view this class roster." });
    }

    res.status(200).json(targetClass.students);
  } catch (error) {
    console.error("Fetch Roster Error:", error);
    res.status(500).json({ message: "Failed to fetch student roster." });
  }
};

// ==========================================
// 3. UPDATE & DELETE FUNCTIONS
// ==========================================

/**
 * @desc    Update a Class
 * @route   PUT /api/classes/:id
 */
export const updateClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    const { name, code, department, lecturers, level, academicYear, semester } = req.body;
    if (name) classItem.name = name;
    if (code) classItem.code = code;
    if (department) classItem.department = department;
    if (lecturers) classItem.lecturers = lecturers;
    if (level) classItem.level = level;
    if (academicYear) classItem.academicYear = academicYear;
    if (semester) classItem.semester = semester;

    await classItem.save();
    res.status(200).json(classItem);
  } catch (error) {
    console.error("Update Class Error:", error);
    res.status(500).json({ message: "Failed to update class." });
  }
};

/**
 * @desc    Delete a Class
 * @route   DELETE /api/classes/:id
 */
export const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    await classItem.deleteOne();
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Delete Class Error:", error);
    res.status(500).json({ message: "Failed to delete class." });
  }
};

// ==========================================
// 4. STUDENT ASSIGNMENT FUNCTIONS
// ==========================================

/**
 * @desc    Assign a student to a class
 * @route   POST /api/classes/:classId/assign-student
 */
export const assignStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;

    const classItem = await Class.findById(classId).populate('department');
    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: "User is not a student" });
    }

    if (classItem.students.includes(studentId)) {
      return res.status(400).json({ message: "Student already enrolled in this class" });
    }

    // Get hierarchical info from class -> department -> school -> college
    const department = classItem.department;
    const school = department?.school ? await School.findById(department.school).populate('college') : null;
    const college = school?.college ? await College.findById(school.college) : null;

    // Update student with hierarchical info
    student.department = department?._id;
    student.school = school?._id;
    student.college = college?._id;
    student.level = classItem.level;
    student.classId = classItem._id;
    await student.save();

    classItem.students.push(studentId);
    await classItem.save();

    res.status(200).json({ 
      message: "Student assigned to class successfully",
      class: classItem,
      student: {
        department: department?.name,
        school: school?.name,
        college: college?.name,
        level: classItem.level
      }
    });
  } catch (error) {
    console.error("Assign Student Error:", error);
    res.status(500).json({ message: "Failed to assign student to class." });
  }
};

/**
 * @desc    Remove a student from a class
 * @route   DELETE /api/classes/:classId/remove-student/:studentId
 */
export const removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if student is in class (handle both ObjectId and string comparison)
    const studentInClass = classItem.students.some(s => 
      s.toString() === studentId || s === studentId
    );
    
    if (!studentInClass) {
      return res.status(400).json({ message: "Student not enrolled in this class" });
    }

    classItem.students = classItem.students.filter(s => s.toString() !== studentId);
    await classItem.save();

    res.status(200).json({ message: "Student removed from class successfully", class: classItem });
  } catch (error) {
    console.error("Remove Student Error:", error);
    res.status(500).json({ message: "Failed to remove student from class." });
  }
};