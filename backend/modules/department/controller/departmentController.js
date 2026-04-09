import Department from '../model/Department.js';
import School from '../../school/model/School.js';
import User from '../../user/model/User.js';

// @desc    Create a new Department
// @route   POST /api/departments
// @access  Private (Admin only)
export const createDepartment = async (req, res) => {
  try {
    const { name, code, school, hod } = req.body;

    // 1. Check if the parent School exists
    const parentSchool = await School.findById(school);
    if (!parentSchool) {
      return res.status(404).json({ message: 'Parent School not found' });
    }

    // 2. Check if department code already exists
    const deptExists = await Department.findOne({ code });
    if (deptExists) {
      return res.status(400).json({ message: 'Department with this code already exists' });
    }

    // If HoD is being assigned, update their role
    if (hod) {
      const hodUser = await User.findById(hod);
      if (hodUser) {
        hodUser.role = 'hod';
        hodUser.department = req.body.id;
        await hodUser.save();
      }
    }

    const department = await Department.create({
      name,
      code,
      school,
      hod
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all Departments (optionally filtered by School)
// @route   GET /api/departments?schoolId=XYZ
// @access  Public
export const getDepartments = async (req, res) => {
  try {
    const { schoolId } = req.query;
    
    // Filter by school if the ID is provided
    const query = schoolId ? { school: schoolId } : {};
    
    const departments = await Department.find(query)
      .populate({
        path: 'school',
        select: 'name code',
        populate: { path: 'college', select: 'name code' } // Nested population!
      })
      .populate('hod', 'name email');

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update Department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { name, code, school, hod } = req.body;
    
    // Handle role change when HoD is assigned
    if (hod && hod !== department.hod?.toString()) {
      // If there was a previous HoD, revert their role
      if (department.hod) {
        await User.findByIdAndUpdate(department.hod, { role: 'lecturer' });
      }
      // Set new HoD's role to hod
      const newHoD = await User.findById(hod);
      if (newHoD) {
        newHoD.role = 'hod';
        newHoD.department = department._id;
        await newHoD.save();
      }
    }
    
    // Handle unassigning HoD
    if (!hod && department.hod) {
      await User.findByIdAndUpdate(department.hod, { role: 'lecturer' });
    }

    if (name) department.name = name;
    if (code) department.code = code;
    if (school) department.school = school;
    if (hod !== undefined) department.hod = hod;

    await department.save();
    const updated = await Department.findById(req.params.id)
      .populate({ path: 'school', select: 'name code', populate: { path: 'college', select: 'name code' } })
      .populate('hod', 'name email');
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete Department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.deleteOne();
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};