import User from '../model/User.js';
import Class from '../../class/model/Class.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { generateURStudentID } from '../../../middleware/authMiddleware.js'; 

// Helper function to validate ObjectIds
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Register a new user (Self-registration)
// @route   POST /api/users/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role, 
      phoneNumber,
      college,
      school,
      department,
      level,
      interests,
      profilePicture 
    } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    // 2. Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 3. Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12); 

    // 4. Force strict role assignment (Only allow "student" for public registration)
    const allowedRoles = ["student"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    // 5. Build user object defensively
    const userData = {
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: assignedRole,
      interests: interests || [],
      profilePicture: profilePicture || ""
    };

    // Only assign level if they are actually a student
    if (assignedRole === "student" && level) {
      userData.level = level;
    }

    // Only save hierarchy fields if they are valid ObjectIds
    if (college && isValidId(college)) userData.college = college;
    if (school && isValidId(school)) userData.school = school;
    if (department && isValidId(department)) userData.department = department;

    // 6. Create user
    const user = await User.create(userData);

    // 7. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        level: user.level,
        interests: user.interests,
        profilePicture: user.profilePicture 
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // POPULATE department and classId so the frontend gets usable objects, not just IDs
    const user = await User.findOne({ email })
      .select('+password')
      .populate('department', 'name code') 
      .populate('classId', 'name code level'); 

    if (user && (await bcrypt.compare(password, user.password))) {
      
      // Base user profile for ALL roles
      let userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department, // Now populated! (e.g., { _id: "...", name: "Info Tech" })
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture
      };

      // Role-specific data injection
      if (user.role === 'student') {
        userData.studentID = user.studentID;
        userData.level = user.level;
        userData.interests = user.interests;
        userData.classInfo = user.classId; 
      }

      res.status(200).json({
        success: true,
        token: jwt.sign(
          { id: user._id, role: user.role, department: user.department?._id }, 
          process.env.JWT_SECRET, 
          { expiresIn: '30d' }
        ),
        user: userData 
      });

    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department', 'name code')
      .populate('classId', 'name code level');
    
    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

// @desc    Update user profile 
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.interests = req.body.interests || user.interests; 
      user.fcmToken = req.body.fcmToken || user.fcmToken; 
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      // Only allow updating level if they are a student
      if (user.role === 'student' && req.body.level) {
        user.level = req.body.level; 
      }

      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 12);
      }

      const updatedUser = await user.save();
      
      await updatedUser.populate('department', 'name code');
      await updatedUser.populate('classId', 'name code level');

      res.status(200).json({
        success: true,
        user: updatedUser 
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
};

// @desc    Delete account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      // OPTIMIZATION: If user belongs to a class, remove them from the class array first
      if (user.classId) {
        await Class.findByIdAndUpdate(user.classId, {
          $pull: { students: user._id }
        });
      }

      await user.deleteOne();
      res.status(200).json({ success: true, message: "User removed successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error deleting user" });
  }
};

// @desc    HOD Action: Enroll a new student and assign them to a class
// @route   POST /api/users/enroll
// @access  Private/HOD (Requires role middleware)
export const enrollStudent = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, classId } = req.body;

    if (!name || !email || !password || !classId) {
      return res.status(400).json({ success: false, message: "Name, email, password, and classId are required" });
    }

    if (!isValidId(classId)) {
      return res.status(400).json({ success: false, message: "Invalid class ID format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // SMART ENROLLMENT: We fetch the class so the student inherits its department and level!
    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newStudentID = await generateURStudentID(); 

    // Create the student, inheriting the exact relational data from the Class they are joining
    const student = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "student",
      studentID: newStudentID, 
      classId: classId,
      department: targetClass.department, // INHERITED!
      level: targetClass.level // INHERITED!
    });

    // Add student to the class array
    await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: student._id } }
    );

    await student.populate('classId', 'name code level');
    await student.populate('department', 'name');

    res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      student: {
        _id: student._id,
        studentID: student.studentID, 
        name: student.name,
        email: student.email,
        role: student.role,
        department: student.department,
        level: student.level,
        classInfo: student.classId 
      }
    });

  } catch (error) {
    console.error("Enrollment Error:", error);
    res.status(500).json({ success: false, message: "Enrollment failed", error: error.message });
  }
};