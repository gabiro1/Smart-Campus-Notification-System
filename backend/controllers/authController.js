import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Register a new student/admin
// normal users to register as admin or hod freely. Only students can register themselves, other roles must be assigned by an admin or through a secure process.
const allowedRoles = ["student"];
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNumber,
      school,
      department,
      level,
      interests
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      school,
      department,
      level,
      interests: interests || [],
      role: allowedRoles.includes(role) ? role : "student"
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
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
        school: user.school,
        department: user.department,
        level: user.level,
        interests: user.interests,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user & get token
export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            success: true,
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school,
                department: user.department,
                level: user.level,
                interests: user.interests,
                phoneNumber: user.phoneNumber
            }
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

// @desc    Get current user profile
export const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// @desc    Update profile (e.g., Student moves to Level 4 or changes interests)
export const updateProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.level = req.body.level || user.level;
        user.interests = req.body.interests || user.interests; // AI updates here
        user.fcmToken = req.body.fcmToken || user.fcmToken; // Update device token

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// @desc    Delete account
export const deleteUser = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: "User removed successfully" });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};