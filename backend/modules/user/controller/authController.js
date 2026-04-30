import User from '../model/User.js';
import Class from '../../class/model/Class.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateURStudentID } from '../../../middleware/authMiddleware.js';

// Reuse email transporter from notification module
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const transporter = getTransporter();
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Verify Your Email - UniNotify AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniNotify AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #4b5563; line-height: 1.6;">Welcome to UniNotify AI! Please verify your email address to get started:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link expires in <strong>24 hours</strong>.</p>
          </div>
          <div class="footer">
            <p>UniNotify AI - Smart Campus Notification System</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const transporter = getTransporter();
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Reset Your UniNotify AI Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniNotify AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #4b5563; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link expires in <strong>1 hour</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>UniNotify AI - Smart Campus Notification System</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
}; 

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
        profilePicture: user.profilePicture,
        languagePreference: user.languagePreference // Add language preference
      };

      // Role-specific data injection
      if (user.role === 'student') {
        userData.studentID = user.studentID;
        userData.level = user.level;
        userData.interests = user.interests;
        userData.classInfo = user.classId;
        userData.notificationPreferences = user.notificationPreferences;
        userData.quietHours = user.quietHours;
        userData.hasCompletedOnboarding = user.hasCompletedOnboarding;
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
      .populate([
        { path: 'college', select: 'name code' },
        { path: 'school', select: 'name code' },
        { path: 'department', select: 'name code' },
        { path: 'classId', select: 'name code level' }
      ]);
    
    if (user) {
      console.log("Profile loaded for user:", user.email, "classId:", user.classId);
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
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

      // Language preference for Kinyarwanda translation
      if (req.body.languagePreference) {
        user.languagePreference = req.body.languagePreference;
      }

      // Only allow updating level if they are a student
      if (user.role === 'student' && req.body.level) {
        user.level = req.body.level;
      }

      // Quiet Hours (Do Not Disturb)
      if (req.body.quietHours !== undefined) {
        user.quietHours = req.body.quietHours;
      }

      // Digest Email Setting
      if (req.body.digestEnabled !== undefined) {
        user.digestEnabled = req.body.digestEnabled;
      }

      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 12);
      }

      const updatedUser = await user.save();

      try {
        await updatedUser.populate('department', 'name code');
      } catch (e) { /* field may not exist */ }
      
      try {
        await updatedUser.populate('classId', 'name code level');
      } catch (e) { /* field may not exist */ }

      try {
        await updatedUser.populate('college', 'name code');
      } catch (e) { /* field may not exist */ }
      
      try {
        await updatedUser.populate('school', 'name code');
      } catch (e) { /* field may not exist */ }

      res.status(200).json({
        success: true,
        user: updatedUser
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: "Server error updating profile", error: error.message });
  }
};

// @desc    Update notification preferences (granular control)
// @route   PUT /api/users/notification-preferences
// @access  Private (User can only update their own)
export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { preferences } = req.body;

    // Validate structure
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ success: false, message: "Invalid preferences payload" });
    }

    // Ensure categories object exists
    if (!user.notificationPreferences.categories) {
      user.notificationPreferences.categories = {
        events: { push: true, email: true, sms: false },
        reminders: { push: true, email: true, sms: false },
        governance: { push: true, email: true, sms: false }
      };
    }

    // Merge global channel toggles
    if (preferences.push !== undefined) user.notificationPreferences.push = preferences.push;
    if (preferences.email !== undefined) user.notificationPreferences.email = preferences.email;
    if (preferences.sms !== undefined) user.notificationPreferences.sms = preferences.sms;

    // Merge category-specific overrides
    if (preferences.categories) {
      const cats = preferences.categories;
      if (cats.events) {
        if (cats.events.push !== undefined) user.notificationPreferences.categories.events.push = cats.events.push;
        if (cats.events.email !== undefined) user.notificationPreferences.categories.events.email = cats.events.email;
        if (cats.events.sms !== undefined) user.notificationPreferences.categories.events.sms = cats.events.sms;
      }
      if (cats.reminders) {
        if (cats.reminders.push !== undefined) user.notificationPreferences.categories.reminders.push = cats.reminders.push;
        if (cats.reminders.email !== undefined) user.notificationPreferences.categories.reminders.email = cats.reminders.email;
        if (cats.reminders.sms !== undefined) user.notificationPreferences.categories.reminders.sms = cats.reminders.sms;
      }
      if (cats.governance) {
        if (cats.governance.push !== undefined) user.notificationPreferences.categories.governance.push = cats.governance.push;
        if (cats.governance.email !== undefined) user.notificationPreferences.categories.governance.email = cats.governance.email;
        if (cats.governance.sms !== undefined) user.notificationPreferences.categories.governance.sms = cats.governance.sms;
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Notification preferences updated",
      preferences: updatedUser.notificationPreferences
    });
  } catch (error) {
    console.error("Update Preferences Error:", error);
    res.status(500).json({ success: false, message: "Failed to update preferences" });
  }
};

// @desc    Complete onboarding (first login setup)
// @route   PUT /api/users/onboarding
// @access  Private (student only, must not have completed onboarding)
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Only students need onboarding (others skip)
    if (user.role !== 'student') {
      return res.status(400).json({ success: false, message: "Onboarding is only for students" });
    }

    // If already completed, return success (idempotent)
    if (user.hasCompletedOnboarding) {
      return res.status(200).json({
        success: true,
        message: "Onboarding already completed",
        completed: true
      });
    }

    const { interests, channelPreferences, quietHours } = req.body;

    // Validate and update interests (array of strings)
    if (Array.isArray(interests)) {
      // Filter out empty/whitespace entries
      user.interests = interests
        .filter(i => typeof i === 'string' && i.trim().length > 0)
        .map(i => i.trim().toLowerCase());
    }

    // Update notification preferences from channelPreferences
    if (channelPreferences && typeof channelPreferences === 'object') {
      // Global toggles
      if (channelPreferences.push !== undefined) user.notificationPreferences.push = Boolean(channelPreferences.push);
      if (channelPreferences.email !== undefined) user.notificationPreferences.email = Boolean(channelPreferences.email);
      if (channelPreferences.sms !== undefined) user.notificationPreferences.sms = Boolean(channelPreferences.sms);

      // Ensure categories object exists
      if (!user.notificationPreferences.categories) {
        user.notificationPreferences.categories = {
          events: { push: true, email: true, sms: false },
          reminders: { push: true, email: true, sms: false },
          governance: { push: true, email: true, sms: false }
        };
      }

      // Category-specific overrides if provided
      if (channelPreferences.categories) {
        const cats = channelPreferences.categories;
        if (cats.events) {
          if (cats.events.push !== undefined) user.notificationPreferences.categories.events.push = Boolean(cats.events.push);
          if (cats.events.email !== undefined) user.notificationPreferences.categories.events.email = Boolean(cats.events.email);
          if (cats.events.sms !== undefined) user.notificationPreferences.categories.events.sms = Boolean(cats.events.sms);
        }
        if (cats.reminders) {
          if (cats.reminders.push !== undefined) user.notificationPreferences.categories.reminders.push = Boolean(cats.reminders.push);
          if (cats.reminders.email !== undefined) user.notificationPreferences.categories.reminders.email = Boolean(cats.reminders.email);
          if (cats.reminders.sms !== undefined) user.notificationPreferences.categories.reminders.sms = Boolean(cats.reminders.sms);
        }
        if (cats.governance) {
          if (cats.governance.push !== undefined) user.notificationPreferences.categories.governance.push = Boolean(cats.governance.push);
          if (cats.governance.email !== undefined) user.notificationPreferences.categories.governance.email = Boolean(cats.governance.email);
          if (cats.governance.sms !== undefined) user.notificationPreferences.categories.governance.sms = Boolean(cats.governance.sms);
        }
      }
    }

    // Update quiet hours if provided
    if (quietHours && typeof quietHours === 'object') {
      const { startTime, endTime } = quietHours;
      // Validate format: "HH:MM" (24-hour)
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (startTime && typeof startTime === 'string' && timeRegex.test(startTime)) {
        user.quietHours.startTime = startTime;
      }
      if (endTime && typeof endTime === 'string' && timeRegex.test(endTime)) {
        user.quietHours.endTime = endTime;
      }
    }

    // Mark onboarding as complete
    user.hasCompletedOnboarding = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        interests: user.interests,
        notificationPreferences: user.notificationPreferences,
        quietHours: user.quietHours,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      }
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    res.status(500).json({ success: false, message: "Failed to complete onboarding", error: error.message });
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

// @desc    Generate email verification token & send email
// @route   POST /api/users/request-verification
// @access  Private (must be logged in)
export const requestVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    // Send email (async, don't wait)
    sendVerificationEmail(user.email, token).catch(console.error);

    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Verification Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to send verification email" });
  }
};

// @desc    Verify email address
// @route   GET /api/users/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // For security, return 200 even if email not found
      return res.status(200).json({ success: true, message: "If email exists, reset instructions sent" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, token);
    res.status(200).json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

// @desc    Reset password with token
// @route   PUT /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Private (must provide valid refresh token)
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Optionally rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ success: false, message: "Failed to refresh token" });
  }
};

// @desc    Logout (invalidate refresh token)
// @route   POST /api/users/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Convert to base64 data URL for storage
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    user.profilePicture = base64Image;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo updated",
      user
    });
  } catch (error) {
    console.error('UploadPhoto error:', error);
    res.status(500).json({ success: false, message: "Failed to upload photo" });
  }
};// @desc    Google OAuth login/register
// @route   POST /api/users/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential, role = 'student' } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    // Verify Google token
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture: profilePicture } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with same email (local account)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing local account
        user.googleId = googleId;
        user.provider = 'google';
        if (!user.profilePicture && profilePicture) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      } else {
        // Create new user from Google data
        const School = (await import('../../school/model/School.js')).default;
        const Department = (await import('../../department/model/Department.js')).default;
        
        const defaultSchool = await School.findOne({}).select('_id');
        const defaultDept = await Department.findOne({}).select('_id');

        user = await User.create({
          name,
          email,
          googleId,
          provider: 'google',
          profilePicture,
          role: 'student',
          school: defaultSchool?._id,
          department: defaultDept?._id,
          level: 'Year 1',
          password: await bcrypt.hash(Math.random().toString(36).slice(-12), 12),
          emailVerified: true,
        });
      }
    }

    // Populate user data
    const populatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('classId', 'name code level');

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department?._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Build user data response
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      emailVerified: true,
    };

    if (user.role === 'student') {
      userData.studentID = user.studentID;
      userData.level = user.level;
      userData.interests = user.interests;
      userData.classInfo = populatedUser.classId;
      userData.notificationPreferences = user.notificationPreferences;
      userData.quietHours = user.quietHours;
      userData.hasCompletedOnboarding = user.hasCompletedOnboarding;
    }

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
  }
};
