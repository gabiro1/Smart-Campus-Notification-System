import School from '../model/School.js';
import College from '../../college/model/College.js';

// @desc    Create a new School
// @route   POST /api/schools
// @access  Private (Admin only)
export const createSchool = async (req, res) => {
  try {
    const { name, code, college, dean } = req.body;

    // 1. Check if the parent College exists
    const parentCollege = await College.findById(college);
    if (!parentCollege) {
      return res.status(404).json({ message: 'Parent College not found' });
    }

    // 2. Check if school code already exists
    const schoolExists = await School.findOne({ code });
    if (schoolExists) {
      return res.status(400).json({ message: 'School with this code already exists' });
    }

    const school = await School.create({
      name,
      code,
      college,
      dean
    });

    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all Schools (optionally filtered by College)
// @route   GET /api/schools?collegeId=XYZ
// @access  Public
export const getSchools = async (req, res) => {
  try {
    const { collegeId } = req.query;
    
    // If a collegeId is provided in the URL, filter by it. Otherwise, get all.
    const query = collegeId ? { college: collegeId } : {};
    
    const schools = await School.find(query)
      .populate('college', 'name code') // Show college details
      .populate('dean', 'name email');   // Show dean details

    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};