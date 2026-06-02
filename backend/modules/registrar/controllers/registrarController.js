import User from '../../user/model/User.js';
import Class from '../../class/model/Class.js';
import Department from '../../department/model/Department.js';
import AuditLog from '../../audit/models/AuditLog.js';
import Counter, { getNextSequence } from '../../../../models/Counter.js';
import bcrypt from 'bcryptjs';
import { generateURStudentID } from '../../../middleware/authMiddleware.js';

const YY = () => new Date().getFullYear().toString().slice(-2);

const getDeptCode = async (deptId) => {
  if (!deptId) return '001';
  const dept = await Department.findById(deptId).select('code');
  if (!dept) return '001';
  const key = `dept_code_${dept._id}`;
  let code = await Counter.findById(key);
  if (!code) {
    const existingCount = await Counter.countDocuments({ _id: /^dept_code_/ });
    code = await Counter.findByIdAndUpdate(
      key,
      { $setOnInsert: { seq: existingCount + 1 } },
      { new: true, upsert: true }
    );
  }
  return String(code.seq).padStart(3, '0');
};

const generateRegistrationNumberAtomic = async (deptId) => {
  const year = YY();
  const deptCode = await getDeptCode(deptId);
  const seq = await getNextSequence(`reg_seq_${year}_${deptCode}`);
  return `${year}${deptCode}${String(seq).padStart(4, '0')}`;
};

const logAudit = async (adminId, action, targetId, targetType, description) => {
  try {
    await AuditLog.create({ adminId, action, targetId, targetType, description, status: 'SUCCESS' });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, classId, level, department } = req.body;

    const errors = {};
    if (!name?.trim()) errors.name = 'Full name is required';
    if (!email?.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
        errors: { email: 'Email is already registered' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const studentID = await generateURStudentID();

    let resolvedDepartment = department || null;
    let resolvedLevel = level || null;
    let resolvedSchool = null;
    let resolvedCollege = null;

    if (classId) {
      const targetClass = await Class.findById(classId).populate({
        path: 'department',
        select: 'school code',
        populate: { path: 'school', select: 'college' }
      });

      if (targetClass) {
        resolvedDepartment = targetClass.department?._id || department;
        resolvedLevel = targetClass.level || level;
        resolvedSchool = targetClass.department?.school?._id || null;
        resolvedCollege = targetClass.department?.school?.college || null;
      }
    }

    const registrationNumber = await generateRegistrationNumberAtomic(resolvedDepartment);

    const student = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword,
      phoneNumber: phoneNumber || '',
      role: 'student',
      studentID,
      registrationNumber,
      mustChangePassword: true,
      status: 'ACTIVE',
      createdBy: req.user._id,
      classId: classId || null,
      department: resolvedDepartment,
      level: resolvedLevel,
      school: resolvedSchool,
      college: resolvedCollege
    });

    if (classId) {
      await Class.findByIdAndUpdate(classId, { $addToSet: { students: student._id } });
    }

    await logAudit(req.user._id, 'CREATE_STUDENT_ACCOUNT', student._id, 'USER',
      `Created student account for ${name} (${registrationNumber})`);

    const populated = await User.findById(student._id)
      .populate('classId', 'name code level')
      .populate('department', 'name code');

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: {
        _id: populated._id,
        name: populated.name,
        email: populated.email,
        studentID: populated.studentID,
        registrationNumber: populated.registrationNumber,
        role: populated.role,
        classInfo: populated.classId,
        department: populated.department,
        level: populated.level
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'registrationNumber') {
        return res.status(409).json({
          success: false,
          message: 'Registration number collision. Please retry.',
          errors: { registrationNumber: 'System error: duplicate reg number. Try again.' }
        });
      }
      if (field === 'email') {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists',
          errors: { email: 'Email is already registered' }
        });
      }
    }
    console.error('createStudent Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const importStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'students array is required' });
    }

    if (students.length > 200) {
      return res.status(400).json({ success: false, message: 'Maximum 200 students per import batch' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const s of students) {
      try {
        if (!s.name || !s.email) {
          results.errors.push({ email: s.email || 'unknown', reason: 'Missing name or email' });
          continue;
        }

        const existing = await User.findOne({ email: s.email });
        if (existing) {
          results.skipped++;
          continue;
        }

        const hashedPassword = await bcrypt.hash(s.password || 'Student@123', 12);
        const studentID = await generateURStudentID();

        let deptId = s.department;

        if (s.classId) {
          const cls = await Class.findById(s.classId).populate('department', 'code');
          if (cls) {
            deptId = cls.department?._id || cls.department;
            level = cls.level;
          }
        }

        const regNumber = await generateRegistrationNumberAtomic(deptId);

        const student = await User.create({
          name: s.name, email: s.email, password: hashedPassword,
          phoneNumber: s.phoneNumber || '',
          role: 'student', studentID, registrationNumber: regNumber,
          mustChangePassword: true,
          status: 'ACTIVE',
          createdBy: req.user._id,
          classId: s.classId || null,
          department: deptId || null,
          level: level || null
        });

        if (s.classId) {
          await Class.findByIdAndUpdate(s.classId, { $addToSet: { students: student._id } });
        }

        results.created++;
      } catch (err) {
        results.errors.push({ email: s.email || 'unknown', reason: err.message });
      }
    }

    await logAudit(req.user._id, 'CREATE_STUDENT_ACCOUNT', null, 'USER',
      `Bulk import: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`);

    return res.status(201).json({ success: true, message: 'Import completed', data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, department, classId, level } = req.query;
    const query = { role: 'student' };

    if (department) query.department = department;
    if (classId) query.classId = classId;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentID: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await User.find(query)
      .select('-password')
      .populate('classId', 'name code level')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('classId', 'name code level')
      .populate('department', 'name code')
      .populate('school', 'name code')
      .populate('college', 'name code');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const allowedFields = ['name', 'phoneNumber', 'level', 'classId', 'department', 'school', 'college', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    await student.save();

    return res.status(200).json({ success: true, message: 'Student updated', data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = student.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await student.save();

    await logAudit(req.user._id, 'UPDATE_USER', student._id, 'USER',
      `Student ${student.name} ${student.status === 'SUSPENDED' ? 'suspended' : 'reactivated'}`);

    return res.status(200).json({
      success: true,
      message: `Student ${student.status === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrollmentStats = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: 'student' });
    const active = await User.countDocuments({ role: 'student', status: 'ACTIVE' });
    const suspended = await User.countDocuments({ role: 'student', status: 'SUSPENDED' });
    const byDepartment = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byLevel = await User.aggregate([
      { $match: { role: 'student', level: { $ne: null } } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const populatedDepts = (
      await Promise.all(
        byDepartment.map(async (d) => {
          if (!d._id) return null;
          try {
            const dept = await Department.findById(d._id).select('name code');
            if (!dept) return null;
            return { department: dept.name, code: dept.code, count: d.count };
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean);

    return res.status(200).json({
      success: true,
      data: { total, active, suspended, byDepartment: populatedDepts, byLevel }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const previewRegNumber = async (req, res) => {
  try {
    const { department: deptId } = req.query;
    if (!deptId) {
      return res.status(400).json({ success: false, message: 'department query param is required' });
    }
    const year = new Date().getFullYear().toString().slice(-2);
    const dept = await Department.findById(deptId).select('name code');
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    const deptCode = await getDeptCode(deptId);
    const counterKey = `reg_seq_${year}_${deptCode}`;
    const counter = await Counter.findById(counterKey);
    const nextSeq = (counter?.seq || 0) + 1;
    const regNumber = `${year}${deptCode}${String(nextSeq).padStart(4, '0')}`;
    return res.status(200).json({ success: true, data: { regNumber, department: dept.name, year } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
