import College from '../model/College.js';
import User from '../../user/model/User.js';

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

    // If principal is being assigned, update their role
    if (principal) {
      const principalUser = await User.findById(principal);
      if (principalUser) {
        principalUser.role = 'principal';
        principalUser.college = principal;
        await principalUser.save();
      }
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

// @desc    Update College
// @route   PUT /api/colleges/:id
// @access  Private (Admin only)
export const updateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const { name, code, principal } = req.body;
    
    // Handle role change when principal is assigned
    if (principal && principal !== college.principal?.toString()) {
      // If there was a previous principal, revert their role
      if (college.principal) {
        await User.findByIdAndUpdate(college.principal, { role: 'lecturer' });
      }
      // Set new principal's role to principal
      const newPrincipal = await User.findById(principal);
      if (newPrincipal) {
        newPrincipal.role = 'principal';
        newPrincipal.college = college._id;
        await newPrincipal.save();
      }
    }
    
    // Handle unassigning principal
    if (!principal && college.principal) {
      await User.findByIdAndUpdate(college.principal, { role: 'lecturer' });
    }

    if (name) college.name = name;
    if (code) college.code = code;
    if (principal !== undefined) college.principal = principal;

    await college.save();
    const updated = await College.findById(req.params.id).populate('principal', 'name email');
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete College
// @route   DELETE /api/colleges/:id
// @access  Private (Admin only)
export const deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    await college.deleteOne();
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};