import Course from '../model/Course.js';
import Class from '../../class/model/Class.js';

// @desc    Create a new Course
export const createCourse = async (req, res) => {
  try {
    const { name, code, classId, lecturerId } = req.body;

    const classExists = await Class.findById(classId);
    if (!classExists) return res.status(404).json({ message: "Class not found" });

    const course = await Course.create({
      name,
      code,
      class: classId,
      lecturer: lecturerId
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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