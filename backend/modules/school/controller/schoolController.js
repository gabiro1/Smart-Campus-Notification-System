import School from '../model/School.js';
import College from '../../college/model/College.js';
import User from '../../user/model/User.js';

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

    // If dean is being assigned, update their role
    if (dean) {
      const deanUser = await User.findById(dean);
      if (deanUser) {
        deanUser.role = 'dean';
        deanUser.school = req.body.id;
        await deanUser.save();
      }
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

// @desc    Update School
// @route   PUT /api/schools/:id
// @access  Private (Admin only)
export const updateSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    const { name, code, college, dean } = req.body;
    
    // Handle role change when dean is assigned
    if (dean && dean !== school.dean?.toString()) {
      // If there was a previous dean, revert their role
      if (school.dean) {
        await User.findByIdAndUpdate(school.dean, { role: 'lecturer' });
      }
      // Set new dean's role to dean
      const newDean = await User.findById(dean);
      if (newDean) {
        newDean.role = 'dean';
        newDean.school = school._id;
        await newDean.save();
      }
    }
    
    // Handle unassigning dean
    if (!dean && school.dean) {
      await User.findByIdAndUpdate(school.dean, { role: 'lecturer' });
    }

    if (name) school.name = name;
    if (code) school.code = code;
    if (college) school.college = college;
    if (dean !== undefined) school.dean = dean;

    await school.save();
    const updated = await School.findById(req.params.id)
      .populate('college', 'name code')
      .populate('dean', 'name email');
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete School
// @route   DELETE /api/schools/:id
// @access  Private (Admin only)
export const deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    await school.deleteOne();
    res.status(200).json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};