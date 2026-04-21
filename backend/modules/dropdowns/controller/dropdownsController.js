import School from '../../school/model/School.js';
import Department from '../../department/model/Department.js';

export const getDropdownSchools = async (req, res) => {
  try {
    const schools = await School.find().select('name code');
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getDropdownDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select('name code school');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getDropdownLevels = async (req, res) => {
  try {
    const levels = [
      { name: 'Level 1' },
      { name: 'Level 2' },
      { name: 'Level 3' },
      { name: 'Level 4' },
      { name: 'Level 5' },
      { name: 'Level 6' },

    ];
    res.status(200).json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};