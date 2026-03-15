import College from '../model/College.js';

// @desc    Create a new College
// @route   POST /api/colleges
// @access  Private (Admin only)
export const createCollege = async (req, res) => {
  try {
    const { name, code, principal } = req.body;

    // Check if college already exists
    const collegeExists = await College.findOne({ code });
    if (collegeExists) {
      return res.status(400).json({ message: 'College with this code already exists' });
    }

    const college = await College.create({
      name,
      code,
      principal
    });

    res.status(201).json(college);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all Colleges
// @route   GET /api/colleges
// @access  Public
export const getColleges = async (req, res) => {
  try {
    // .populate('principal') will swap the ID for the actual user details
    const colleges = await College.find().populate('principal', 'name email');
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};