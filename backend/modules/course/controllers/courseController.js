import Course from '../model/Course.js';
import Class from '../../class/model/Class.js';
import User from '../../user/model/User.js';

// @desc    Create a new Course
export const createCourse = async (req, res) => {
  try {
    const { name, code, class: classId, lecturer, semester } = req.body;

    if (!classId) return res.status(400).json({ message: "Class is required" });

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) return res.status(404).json({ message: "Class not found" });

    // If lecturer provided, validate they exist and update their role
    if (lecturer) {
      const lecturerUser = await User.findById(lecturer);
      if (lecturerUser && lecturerUser.role !== 'lecturer') {
        lecturerUser.role = 'lecturer';
        lecturerUser.department = classExists.department;
        await lecturerUser.save();
      }
    }

    const course = await Course.create({
      name,
      code,
      class: classId,
      lecturer,
      semester
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('class', 'name level')
      .populate('lecturer', 'name email');

    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all courses (Admin)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({
        path: 'class',
        select: 'name level academicYear',
        populate: { path: 'department', select: 'name code' }
      })
      .populate('lecturer', 'name email role')
      .lean();
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

// @desc    Update Course
export const updateCourse = async (req, res) => {
  try {
    const { name, code, class: classId, lecturer, semester } = req.body;
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // If class changed, validate new class exists
    if (classId && classId !== String(course.class)) {
      const classExists = await Class.findById(classId);
      if (!classExists) return res.status(404).json({ message: "Class not found" });
      course.class = classId;
    }

    // Handle lecturer change (including unassignment)
    if (lecturer !== undefined) {
      const lecturerValue = lecturer === "" ? null : lecturer;
      
      // Revert old lecturer role if needed
      if (course.lecturer && String(course.lecturer) !== String(lecturerValue)) {
        await User.findByIdAndUpdate(course.lecturer, { role: 'lecturer' });
      }
      
      // Set new lecturer or null for unassignment
      if (lecturerValue) {
        const newLecturer = await User.findById(lecturerValue);
        if (newLecturer) {
          newLecturer.role = 'lecturer';
          await newLecturer.save();
        }
      }
      course.lecturer = lecturerValue;
    }

    if (name) course.name = name;
    if (code) course.code = code;
    if (semester) course.semester = semester;

    await course.save();

    const updatedCourse = await Course.findById(id)
      .populate('class', 'name level')
      .populate('lecturer', 'name email');

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
};

// @desc    Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    
    if (!course) return res.status(404).json({ message: "Course not found" });

    await course.deleteOne();
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course" });
  }
};

// @desc    Get courses for the logged-in lecturer
export const getMyCourses = async (req, res) => {
  try {
    const lecturerId = req.user._id; 

    const courses = await Course.find({ lecturer: lecturerId })
      .populate({
        path: 'class',
        select: 'name level academicYear',
        populate: { path: 'department', select: 'name code' }
      })
      .lean();

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your courses" });
  }
};