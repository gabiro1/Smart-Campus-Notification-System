import College from '../../college/model/College.js';
import School from '../../school/model/School.js';
import Department from '../../department/model/Department.js';
import Club from '../../club/model/Club.js';

export const getDropdownColleges = async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).select('_id name code');
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getDropdownSchools = async (req, res) => {
  try {
    const filter = req.query.collegeId ? { college: req.query.collegeId } : {};
    const schools = await School.find({ ...filter, isActive: true }).select('_id name code college');
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getDropdownDepartments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolId) filter.school = req.query.schoolId;
    const departments = await Department.find({ ...filter, isActive: true }).select('_id name code school');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getDropdownLevels = async (req, res) => {
  try {
    const levels = [
      { name: 'Year 1' },
      { name: 'Year 2' },
      { name: 'Year 3' },
      { name: 'Year 4' },
      { name: 'Year 5' },
    ];
    res.status(200).json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getDropdownClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true }).select('_id name');
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};