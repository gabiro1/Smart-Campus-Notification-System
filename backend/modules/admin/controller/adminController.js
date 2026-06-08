import User from "../../user/model/User.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { parse } from 'csv-parse/sync';
import Event from '../../event/model/Event.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import Reminder from '../../reminder/model/Reminder.js';
import AuditLog from '../../audit/models/AuditLog.js';
import Announcement from '../../announcement/model/Announcement.js';
import College from '../../college/model/College.js';
import School from '../../school/model/School.js';
import Department from '../../department/model/Department.js';
import Class from '../../class/model/Class.js';
import Course from '../../course/model/Course.js';
import SystemSettings from '../../settings/model/SystemSettings.js';
import Role from '../../role/model/Role.js';
import { chat } from '../../../services/aiProvider.js';



// Helper function to log admin actions
const logAuditAction = async (adminId, action, targetId, targetType, description, changes = {}) => {
    try {
        await AuditLog.create({
            adminId,
            action,
            targetId,
            targetType,
            description,
            changes,
            status: 'SUCCESS'
        });
    } catch (error) {
        console.error('Audit log failed:', error);
    }
};

/**
 * @desc    Get full academic hierarchy for cascading dropdowns
 * @route   GET /api/admin/hierarchy
 */
export const getAcademicHierarchy = async (req, res) => {
  try {
    // Fetch all records as plain JavaScript objects for fast processing
    const colleges = await College.find().lean();
    const schools = await School.find().lean();
    const departments = await Department.find().lean();

    const formattedStructure = {};

    // Assemble the nested object
    colleges.forEach(college => {
      formattedStructure[college.name] = {};
      
      // Find schools belonging to this college
      const collegeSchools = schools.filter(s => String(s.college) === String(college._id));

      collegeSchools.forEach(school => {
        // Find departments belonging to this school
        const schoolDepts = departments.filter(d => String(d.school) === String(school._id));
        
        // Map to an array of department names
        formattedStructure[college.name][school.name] = schoolDepts.map(d => d.name);
      });
    });

    res.status(200).json(formattedStructure);
  } catch (error) {
    console.error("Error fetching hierarchy:", error);
    res.status(500).json({ message: 'Failed to fetch academic structure' });
  }
};

// @desc    Create new user (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, college, school, department, level } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Validate role against the Role collection (supports custom roles too)
        if (role) {
            const roleDoc = await Role.findOne({ name: role.toLowerCase(), isActive: true });
            if (!roleDoc) {
                return res.status(400).json({ message: `Invalid role "${role}". Role does not exist or is inactive.` });
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            college,
            school,
            department,
            level
        });

        res.status(201).json({
            message: "User created successfully",
            user: user.toObject({ virtuals: true })
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard metrics with trends and hourly volume
export const getDashboardMetrics = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalEvents,
            totalReminders,
            totalNotifications,
            todayNotifications,
            yesterdayNotifications,
            todayEvents,
            yesterdayEvents,
            todayNewUsers,
            yesterdayNewUsers,
            usersByRole,
            usersBySchool,
            hourlyVolume,
            notificationRead
        ] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Reminder.countDocuments(),
            NotificationLog.countDocuments(),
            NotificationLog.countDocuments({ createdAt: { $gte: startOfToday } }),
            NotificationLog.countDocuments({ createdAt: { $gte: startOfYesterday, $lt: startOfToday } }),
            Event.countDocuments({ createdAt: { $gte: startOfToday } }),
            Event.countDocuments({ createdAt: { $gte: startOfYesterday, $lt: startOfToday } }),
            User.countDocuments({ createdAt: { $gte: startOfToday } }),
            User.countDocuments({ createdAt: { $gte: startOfYesterday, $lt: startOfToday } }),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            User.aggregate([
                { $lookup: { from: 'schools', localField: 'school', foreignField: '_id', as: 'schoolData' } },
                { $unwind: { path: '$schoolData', preserveNullAndEmptyArrays: true } },
                { $group: { _id: '$schoolData.name', count: { $sum: 1 } } }
            ]),
            NotificationLog.aggregate([
                { $match: { createdAt: { $gte: startOfToday } } },
                { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            NotificationLog.countDocuments({ status: 'read' })
        ]);

        // Build hourly volume array for all 24 hours
        const hourlyMap = {};
        hourlyVolume.forEach(h => { hourlyMap[h._id] = h.count; });
        const volumeByHour = Array.from({ length: 24 }, (_, i) => ({
            hour: `${String(i).padStart(2, '0')}:00`,
            count: hourlyMap[i] || 0
        }));

        // Compute percentage trends
        const calcTrend = (today, yesterday) =>
            yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100)
                : today > 0 ? 100 : 0;

        // Find peak hour
        const peakHour = volumeByHour.reduce((max, h) => h.count > max.count ? h : max, { count: 0 });

        res.json({
            metrics: {
                totalUsers,
                totalEvents,
                totalReminders,
                totalNotifications,
                todayNotifications,
                yesterdayNotifications,
                todayEvents,
                yesterdayEvents,
                todayUsers: todayNewUsers,
                yesterdayUsers: yesterdayNewUsers,
                readRate: totalNotifications > 0 ? Math.round((notificationRead / totalNotifications) * 100) : 0
            },
            trends: {
                messages: calcTrend(todayNotifications, yesterdayNotifications),
                events: calcTrend(todayEvents, yesterdayEvents),
                users: calcTrend(todayNewUsers, yesterdayNewUsers)
            },
            hourlyVolume: volumeByHour,
            peakHour: peakHour.count > 0 ? peakHour.hour : null,
            usersByRole,
            usersBySchool,
            notificationStats: {
                total: totalNotifications,
                read: notificationRead,
                unread: totalNotifications - notificationRead
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users with filters
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, school, department, search, getAll } = req.query;
        
        // If getAll=true, return all users without pagination (for admin dashboard)
        if (getAll === 'true') {
            let query = {};
            if (role) query.role = role;
            if (school) query.school = school;
            if (department) query.department = department;
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await User.find(query)
                .select('-password')
                .populate('college', 'name')
                .populate('school', 'name')
                .populate('department', 'name')
                .sort({ createdAt: -1 });

            // Transform to get plain names
            const transformedUsers = users.map(user => ({
                ...user.toObject(),
                college: user.college?.name || user.college || "",
                school: user.school?.name || user.school || "",
                department: user.department?.name || user.department || ""
            }));

            return res.json({
                users: transformedUsers,
                pagination: { total: users.length, pages: 1, currentPage: 1 }
            });
        }

        const skip = (page - 1) * limit;

        let query = {};
        if (role) query.role = role;
        if (school) query.school = school;
        if (department) query.department = department;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .populate('college', 'name')
            .populate('school', 'name')
            .populate('department', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        // Transform to get plain names
        const transformedUsers = users.map(user => ({
            ...user.toObject(),
            college: user.college?.name || user.college || "",
            school: user.school?.name || user.school || "",
            department: user.department?.name || user.department || ""
        }));

        res.json({
            users: transformedUsers,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user details
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get user stats
        const eventsCreated = await Event.countDocuments({ createdBy: user._id });
        const remindersCreated = await Reminder.countDocuments({ studentId: user._id });
        const notificationsReceived = await NotificationLog.countDocuments({ studentId: user._id });

        res.json({
            user,
            stats: {
                eventsCreated,
                remindersCreated,
                notificationsReceived
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user details
export const updateUser = async (req, res) => {
    try {
        // ADDED college and profilePicture
        const { name, email, phoneNumber, role, college, school, department, level, profilePicture, notificationPreferences } = req.body;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const before = { ...user._doc };

        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        
        // Validate and update role against the Role collection (supports custom roles too)
        if (role) {
            const roleDoc = await Role.findOne({ name: role.toLowerCase(), isActive: true });
            if (!roleDoc) {
                return res.status(400).json({ message: `Invalid role "${role}". Role does not exist or is inactive.` });
            }
            user.role = role;
        }

        if (role === 'hod' && !department && !school) {
          const dept = await Department.findOne({ hod: user._id }).select('school').lean();
          if (dept) {
            user.department = dept._id;
            user.school = dept.school;
            const schoolDoc = await School.findById(dept.school).select('college').lean();
            user.college = schoolDoc?.college || null;
          }
        }
        
        if (college) user.college = college;
        if (school) user.school = school;
        if (department) user.department = department;
        if (level) user.level = level;
        if (profilePicture) user.profilePicture = profilePicture; // <-- Added
        if (notificationPreferences) user.notificationPreferences = notificationPreferences;

        const updatedUser = await user.save();

        // Remove password from response
        const userResponse = updatedUser.toObject({ virtuals: true });
        delete userResponse.password;

        res.json({
            message: "User updated successfully",
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user account
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userName = user.name;

        // Delete user's data
        await Event.deleteMany({ createdBy: user._id });
        await Reminder.deleteMany({ studentId: user._id });
        await NotificationLog.deleteMany({ studentId: user._id });
        await User.findByIdAndDelete(user._id);

        res.json({
            message: "User and all associated data deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Promote user role (Inline Table Action)
export const promoteUser = async (req, res) => {
    try {
        const { role } = req.body;

        const ALLOWED_PROMOTION_ROLES = ['student', 'lecturer', 'hod', 'guild_president', 'dean', 'principal'];
        if (!role || !ALLOWED_PROMOTION_ROLES.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const ROLE_HIERARCHY = { student: 0, class_rep: 1, lecturer: 2, guild_president: 3, hod: 4, dean: 5, principal: 6, admin: 7 };
        const promoterLevel = ROLE_HIERARCHY[req.user.role];
        const targetLevel = ROLE_HIERARCHY[role];
        if (targetLevel >= promoterLevel) {
            return res.status(403).json({ message: "Cannot promote to equal or higher rank" });
        }

        const oldRole = user.role;
        user.role = role;

        if (role === 'hod') {
          const dept = await Department.findOne({ hod: user._id }).select('school').lean();
          if (dept) {
            user.department = dept._id;
            user.school = dept.school;
            const schoolDoc = await School.findById(dept.school).select('college').lean();
            user.college = schoolDoc?.college || null;
          }
        }

        await user.save();
        await logAuditAction(req.user._id, 'PROMOTE_USER', user._id, 'USER', `Role changed from ${oldRole} to ${role}`, { before: oldRole, after: role });

        res.json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset user password (Admin only)
export const resetUserPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await User.findByIdAndUpdate(req.params.userId, { password: hashedPassword });

        await logAuditAction(req.user._id, 'RESET_PASSWORD', user._id, 'USER', `Password reset for ${user.name}`);

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics data
export const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateQuery = {};
        if (startDate) dateQuery.$gte = new Date(startDate);
        if (endDate) dateQuery.$lte = new Date(endDate);

        // Events created over time
        const eventStats = await Event.aggregate([
            { $match: dateQuery.createdAt ? { createdAt: dateQuery } : {} },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        // User engagement
        const userEngagement = await NotificationLog.aggregate([
            { $match: dateQuery.createdAt ? { createdAt: dateQuery } : {} },
            { $group: {
                _id: null,
                totalSent: { $sum: 1 },
                totalRead: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } }
            }}
        ]);

        // Event ratings distribution
        const eventRatings = await Event.aggregate([
            { $unwind: '$ratings' },
            { $group: {
                _id: '$ratings.rating',
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({
            eventStats,
            userEngagement: userEngagement[0] || { totalSent: 0, totalRead: 0 },
            eventRatings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit logs
export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, adminId } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (action) query.action = action;
        if (adminId) query.adminId = adminId;

        const logs = await AuditLog.find(query)
            .populate('adminId', 'name email')
            .populate('targetId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get broadcast history
export const getBroadcastHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        // Events that were created and get their broadcast stats
        const events = await Event.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email');

        // Get notification stats for each event
        const broadcastData = await Promise.all(
            events.map(async (event) => {
                const totalSent = await NotificationLog.countDocuments({ eventId: event._id });
                const totalRead = await NotificationLog.countDocuments({ eventId: event._id, status: 'read' });

                return {
                    eventId: event._id,
                    title: event.title,
                    createdBy: event.createdBy,
                    createdAt: event.createdAt,
                    totalSent,
                    totalRead,
                    readRate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : 0
                };
            })
        );

        const total = await Event.countDocuments();

        res.json({
            broadcasts: broadcastData,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get event monitor (real-time event tracking)
export const getEventMonitor = async (req, res) => {
    try {
        // Active events (within last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeEvents = await Event.find({ createdAt: { $gte: sevenDaysAgo } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('createdBy', 'name email school');

        // Recently created events
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'name email school');

        // Top trending events (by rating count)
        const trendingEvents = await Event.find({ ratings: { $ne: [] } })
            .sort({ 'ratings': -1 })
            .limit(5)
            .populate('createdBy', 'name email school');

        res.json({
            activeEvents,
            recentEvents,
            trendingEvents
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get department statistics
export const getDepartmentStats = async (req, res) => {
    try {
        const departments = await User.aggregate([
            { $group: {
                _id: '$department',
                totalUsers: { $sum: 1 },
                levels: { $push: '$level' }
            }},
            { $sort: { totalUsers: -1 } }
        ]);

        const departmentStats = await Promise.all(
            departments.map(async (dept) => {
                const events = await Event.countDocuments({ targetDept: dept._id });
                const reminders = await Reminder.aggregate([
                    { $match: {} },
                    { $lookup: {
                        from: 'users',
                        localField: 'studentId',
                        foreignField: '_id',
                        as: 'user'
                    }},
                    { $match: { 'user.department': dept._id } },
                    { $count: 'total' }
                ]);

                return {
                    department: dept._id,
                    totalUsers: dept.totalUsers,
                    eventsCount: events,
                    remindersCount: reminders[0]?.total || 0
                };
            })
        );

        res.json({
            departments: departmentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get engagement statistics by department
export const getEngagementByDepartment = async (req, res) => {
    try {
        const engagement = await User.aggregate([
            { $group: {
                _id: '$department',
                totalUsers: { $sum: 1 },
                avgInterests: { $avg: { $size: { $ifNull: ['$interests', []] } } }
            }},
            { $sort: { totalUsers: -1 } }
        ]);

        const departmentEngagement = await Promise.all(
            engagement.map(async (dept) => {
                const readRate = await NotificationLog.aggregate([
                    { $lookup: {
                        from: 'users',
                        localField: 'studentId',
                        foreignField: '_id',
                        as: 'user'
                    }},
                    { $match: { 'user.department': dept._id } },
                    { $group: {
                        _id: null,
                        total: { $sum: 1 },
                        read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } }
                    }}
                ]);

                return {
                    department: dept._id,
                    totalUsers: dept.totalUsers,
                    avgInterests: (dept.avgInterests || 0).toFixed(2),
                    readRate: readRate[0] ? ((readRate[0].read / readRate[0].total) * 100).toFixed(1) : 0,
                    recommendations: dept.avgInterests > 3 ? "High engagement" : "Needs improvement"
                };
            })
        );

        res.json({
            departments: departmentEngagement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active emergency broadcasts with acknowledgment stats
// @route   GET /api/admin/announcements/active-emergencies
// @access  Admin only
export const getActiveEmergencies = async (req, res) => {
  try {
    // Find all active announcements that require acknowledgment
    const activeEmergencies = await Announcement.find({
      status: "Active",
      requiresAcknowledgment: true
    })
    .select('_id title createdAt lecturer')
    .populate('lecturer', 'name')
    .sort({ createdAt: -1 })
    .lean();

    if (activeEmergencies.length === 0) {
      return res.json({ activeEmergencies: [] });
    }

    // For each emergency, compute acknowledgment stats
    const emergenciesWithStats = await Promise.all(
      activeEmergencies.map(async (announcement) => {
        const totalSent = await NotificationLog.countDocuments({
          referenceId: announcement._id
        });

        const acknowledged = await NotificationLog.countDocuments({
          referenceId: announcement._id,
          requiresAcknowledgment: true,
          acknowledgedAt: { $ne: null }
        });

        const pending = totalSent - acknowledged;

        return {
          _id: announcement._id,
          title: announcement.title,
          lecturer: announcement.lecturer?.name || 'Unknown',
          createdAt: announcement.createdAt,
          stats: {
            totalSent,
            acknowledged,
            pending,
            acknowledgedRate: totalSent > 0 ? ((acknowledged / totalSent) * 100).toFixed(1) : 0
          }
        };
      })
    );

    res.json({ activeEmergencies: emergenciesWithStats });
  } catch (error) {
    console.error("Get Active Emergencies Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SYSTEM SETTINGS
// ==========================================

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 */
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ key: 'system' });
    
    if (!settings) {
      // Create default settings if none exist
      settings = await SystemSettings.create({
        key: 'system',
        data: {
          aiAutoApprove: false,
          aiStrictness: 75,
          requireHodApproval: true,
          maintenanceMode: false,
          maxBroadcastReach: 'all',
          smsQuota: { used: 0, limit: 10000 }
        }
      });
    }
    
    res.json({ success: true, data: settings.data });
  } catch (error) {
    console.error("Get System Settings Error:", error);
    res.status(500).json({ message: "Failed to fetch system settings" });
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/admin/settings
 */
export const updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'system' },
      { 
        data: updates,
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    await logAuditAction(req.user._id, 'UPDATE_SETTINGS', null, 'system', 'System settings updated', updates);
    res.json({ success: true, message: "Settings updated successfully", data: settings.data });
  } catch (error) {
    console.error("Update System Settings Error:", error);
    res.status(500).json({ message: "Failed to update system settings" });
  }
};

// ==========================================
// AI-POWERED INSIGHTS
// ==========================================

export const getAIInsights = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Gather analytics data
    const [
      userCount,
      eventCount,
      notificationStats,
      topInterests,
      topDepartments,
      recentEvents,
      engagementByTime
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      NotificationLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $unwind: '$interests' },
        { $group: { _id: '$interests', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Event.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
      NotificationLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%H', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalNotifications = notificationStats.reduce((sum, s) => sum + s.count, 0);
    const readCount = notificationStats.find(s => s._id === 'read')?.count || 0;
    const readRate = totalNotifications > 0 ? ((readCount / totalNotifications) * 100).toFixed(1) : 0;

    const insightsData = {
      totalUsers: userCount,
      eventsCreated: eventCount,
      notificationsSent: totalNotifications,
      readRate,
      topInterests: topInterests.map(i => ({ interest: i._id, count: i.count })),
      topDepartments: topDepartments.map(d => ({ 
        name: d._id?.name || 'Unknown', 
        users: d.count 
      })),
      recentEvents: recentEvents.map(e => ({ title: e.title, date: e.createdAt })),
      peakHours: engagementByTime.map(e => ({ hour: e._id, count: e.count }))
    };

    // Use AI to generate insights
    const prompt = `Analyze this campus notification system data and provide 3-5 actionable insights:
    
    System Overview:
    - ${userCount} total users
    - ${eventCount} events created in last 30 days
    - ${totalNotifications} notifications sent (${readRate}% read rate)
    - Top interests: ${topInterests.slice(0, 5).map(i => i._id).join(', ') || 'None'}
    
    Recent Events: ${recentEvents.map(e => e.title).join(', ')}
    
    Peak Hours: ${engagementByTime.slice(0, 3).map(e => `${e._id}:00 (${e.count} notifications)`).join(', ')}
    
    Provide insights as a JSON array with short title and description. Example format:
    [{"title": "Insight Title", "description": "What this means and what to do about it", "priority": "high|medium|low"}]`;

    let aiInsights = [];
    try {
      const aiResponse = await chat(prompt);
      const content = aiResponse.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiInsights = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.warn('AI insights generation failed:', aiError.message);
      aiInsights = [
        { title: 'Enable AI Recommendations', description: 'Configure AI provider to get personalized insights', priority: 'medium' }
      ];
    }

    res.json({
      data: insightsData,
      insights: aiInsights
    });
  } catch (error) {
    console.error("Get AI Insights Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SYSTEM HEALTH & METRICS
// ==========================================

export const getSystemHealth = async (req, res) => {
  try {
    const [
      userCount,
      eventCount,
      notificationCount,
      announcementCount,
      activeAnnouncements,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      NotificationLog.countDocuments(),
      Announcement.countDocuments(),
      Announcement.countDocuments({ status: 'Active' }),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('adminId', 'name email')
        .lean()
    ]);

    const notificationStats = await NotificationLog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalNotifications = notificationStats.reduce((sum, s) => sum + s.count, 0);
    const readCount = notificationStats.find(s => s._id === 'read')?.count || 0;
    const deliveredCount = notificationStats.find(s => s._id === 'delivered')?.count || 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEvents = await Event.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentNotifications = await NotificationLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: userCount,
          totalEvents: eventCount,
          totalNotifications: notificationCount,
          totalAnnouncements: announcementCount,
          activeAnnouncements: activeAnnouncements
        },
        deliveryRate: totalNotifications > 0 ? ((deliveredCount / totalNotifications) * 100).toFixed(1) : 0,
        readRate: totalNotifications > 0 ? ((readCount / totalNotifications) * 100).toFixed(1) : 0,
        recentActivity: {
          eventsLast7Days: recentEvents,
          notificationsLast7Days: recentNotifications
        },
        systemStatus: {
          database: 'healthy',
          api: 'healthy',
          notifications: 'healthy'
        },
        recentLogs: recentActivity.map(log => ({
          _id: log._id,
          action: log.action,
          description: log.description,
          status: log.status,
          admin: log.adminId?.name || 'System',
          createdAt: log.createdAt
        }))
      }
    });
  } catch (error) {
    console.error("Get System Health Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const runDiagnostics = async (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date(),
      checks: []
    };

    try {
      await User.countDocuments();
      diagnostics.checks.push({ name: 'Database Connection', status: 'success', message: 'MongoDB is responsive' });
    } catch (err) {
      diagnostics.checks.push({ name: 'Database Connection', status: 'error', message: err.message });
    }

    try {
      const eventCount = await Event.countDocuments();
      diagnostics.checks.push({ name: 'Events Module', status: 'success', message: `${eventCount} events found` });
    } catch (err) {
      diagnostics.checks.push({ name: 'Events Module', status: 'error', message: err.message });
    }

    try {
      const notificationCount = await NotificationLog.countDocuments();
      diagnostics.checks.push({ name: 'Notification Service', status: 'success', message: `${notificationCount} notifications processed` });
    } catch (err) {
      diagnostics.checks.push({ name: 'Notification Service', status: 'error', message: err.message });
    }

    const allSuccess = diagnostics.checks.every(c => c.status === 'success');

    await logAuditAction(req.user?._id, 'RUN_DIAGNOSTICS', null, 'system', 'System diagnostics run', { checksCount: diagnostics.checks.length });

    res.json({
      success: true,
      message: allSuccess ? 'All system checks passed' : 'Some checks failed',
      diagnostics
    });
  } catch (error) {
    console.error("Run Diagnostics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// HR ACCOUNT MANAGEMENT (System Admin Only)
// ==========================================

const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const sendAccountSetupEmail = async (email, name, token) => {
  const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${token}`;
  const transporter = getEmailTransporter();
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Your HR Account Has Been Created — Set Your Password',
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
            <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">An HR account has been created for you. Click the button below to set your password and get started:</p>
            <div style="text-align: center;">
              <a href="${setupUrl}" class="button">Set Your Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link expires in <strong>24 hours</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px;">If you didn't expect this, please ignore this email.</p>
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

export const createHRAccount = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const token = crypto.randomBytes(32).toString('hex');

    const hrUser = await User.create({
      name, email, password: hashedPassword, phoneNumber: phoneNumber || '',
      role: 'hr', status: 'ACTIVE', createdBy: req.user._id,
      mustChangePassword: true,
      passwordResetToken: token,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await sendAccountSetupEmail(email, name, token);

    await logAuditAction(req.user._id, 'CREATE_HR_ACCOUNT', hrUser._id, 'USER',
      `Created HR account for ${name} (${email}) — setup email sent`);

    const userResponse = hrUser.toObject();
    delete userResponse.password;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.status(201).json({
      success: true,
      message: 'HR account created successfully. A setup email has been sent to the user.',
      data: userResponse,
    });
  } catch (error) {
    console.error('createHRAccount Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// HR ACCOUNT MANAGEMENT — FULL CRUD
// ==========================================

export const getHRAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'hr' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [hrUsers, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: hrUsers, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHRAccount = async (req, res) => {
  try {
    const hrUser = await User.findOne({ _id: req.params.id, role: 'hr' }).select('-password');
    if (!hrUser) return res.status(404).json({ success: false, message: 'HR account not found' });
    res.json({ success: true, data: hrUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHRAccount = async (req, res) => {
  try {
    const hrUser = await User.findOne({ _id: req.params.id, role: 'hr' });
    if (!hrUser) return res.status(404).json({ success: false, message: 'HR account not found' });

    const { name, email, phoneNumber, status } = req.body;
    if (name !== undefined) hrUser.name = name;
    if (email !== undefined) hrUser.email = email;
    if (phoneNumber !== undefined) hrUser.phoneNumber = phoneNumber;
    if (status !== undefined) hrUser.status = status;

    const updated = await hrUser.save();
    const userResponse = updated.toObject();
    delete userResponse.password;

    await logAuditAction(req.user._id, 'UPDATE_USER', hrUser._id, 'USER', `Updated HR account: ${updated.name}`);
    res.json({ success: true, message: 'HR account updated', data: userResponse });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email already in use' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHRAccount = async (req, res) => {
  try {
    const hrUser = await User.findOne({ _id: req.params.id, role: 'hr' });
    if (!hrUser) return res.status(404).json({ success: false, message: 'HR account not found' });

    await logAuditAction(req.user._id, 'DELETE_USER', hrUser._id, 'USER', `Deleted HR account: ${hrUser.name}`);
    await User.findByIdAndDelete(hrUser._id);
    res.json({ success: true, message: 'HR account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// REGISTRAR ACCOUNT MANAGEMENT (System Admin Only)
// ==========================================

export const createRegistrarAccount = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const regUser = await User.create({
      name, email, password: hashedPassword, phoneNumber: phoneNumber || '',
      role: 'registrar', status: 'ACTIVE', createdBy: req.user._id
    });

    await logAuditAction(req.user._id, 'CREATE_USER', regUser._id, 'USER',
      `Created Registrar account for ${name} (${email})`);

    const userResponse = regUser.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, message: 'Registrar account created successfully', data: userResponse });
  } catch (error) {
    console.error('createRegistrarAccount Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// EMERGENCY OVERRIDE (System Admin Only)
// ==========================================

export const emergencyOverride = async (req, res) => {
  try {
    const { action: overrideAction, targetUserId, reason } = req.body;

    if (!overrideAction || !reason?.trim()) {
      return res.status(400).json({ success: false, message: 'action and reason are required' });
    }

    const validActions = ['ACTIVATE_USER', 'SUSPEND_USER', 'BYPASS_APPROVAL', 'OVERRIDE_ROLE'];
    if (!validActions.includes(overrideAction)) {
      return res.status(400).json({ success: false, message: `Invalid action. Valid: ${validActions.join(', ')}` });
    }

    let result = {};

    if (targetUserId && ['ACTIVATE_USER', 'SUSPEND_USER'].includes(overrideAction)) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ success: false, message: 'Target user not found' });

      if (overrideAction === 'ACTIVATE_USER') {
        targetUser.status = 'ACTIVE';
        result.message = `User ${targetUser.name} activated via emergency override`;
      } else {
        targetUser.status = 'SUSPENDED';
        result.message = `User ${targetUser.name} suspended via emergency override`;
      }
      await targetUser.save();
      result.user = targetUser;
    }

    await logAuditAction(req.user._id, 'EMERGENCY_OVERRIDE', targetUserId || null, 'SYSTEM',
      `Emergency override: ${overrideAction} - ${reason}`);

    res.status(200).json({
      success: true,
      message: result.message || `Emergency override executed: ${overrideAction}`,
      data: { action: overrideAction, reason, ...result }
    });
  } catch (error) {
    console.error('emergencyOverride Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ROLE PERMISSIONS CONFIGURATION
// ==========================================

export const getRolePermissions = async (req, res) => {
  try {
    const rolePermissions = {
      student: { level: 0, canCreate: false, canApprove: false, dashboard: 'read-only' },
      class_rep: { level: 1, canCreate: false, canApprove: false, dashboard: 'read-only' },
      lecturer: { level: 2, canCreate: true, canApprove: false, dashboard: 'academic' },
      guild_president: { level: 3, canCreate: true, canApprove: false, dashboard: 'guild' },
      registrar: { level: 4, canCreate: true, canApprove: false, dashboard: 'registrar' },
      hod: { level: 5, canCreate: true, canApprove: true, dashboard: 'hod' },
      dean: { level: 6, canCreate: true, canApprove: true, dashboard: 'dean' },
      hr: { level: 7, canCreate: true, canApprove: false, dashboard: 'hr' },
      principal: { level: 8, canCreate: true, canApprove: true, dashboard: 'principal' },
      admin: { level: 9, canCreate: true, canApprove: true, dashboard: 'admin', emergencyOverride: true }
    };
    res.json({ success: true, data: rolePermissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// CSV BULK UPLOAD
// ==========================================

const parseCSVBuffer = (buffer) => {
  const raw = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  return raw;
};

const lowerKeys = (obj) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key.toLowerCase().replace(/[^a-z0-9]/g, '')] = obj[key];
  }
  return result;
};

/**
 * @desc    Bulk upload Colleges from CSV
 * @route   POST /api/admin/bulk/colleges
 */
export const bulkUploadColleges = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.collegename;
        const code = (row.code || row.collegecode || '').toUpperCase();
        const principalEmail = row.principalemail || row.principal || '';

        if (!name || !code) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name or code' });
          results.skipped++; continue;
        }

        const exists = await College.findOne({ code });
        if (exists) { results.skipped++; continue; }

        let principalId = null;
        if (principalEmail) {
          const principalUser = await User.findOne({ email: principalEmail.toLowerCase().trim() });
          if (principalUser) {
            principalUser.role = 'principal';
            principalUser.college = null;
            await principalUser.save();
            principalId = principalUser._id;
          }
        }

        await College.create({ name, code, principal: principalId });
        results.created++;
      } catch (err) {
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'COLLEGE', `Bulk uploaded ${results.created} colleges (${results.skipped} skipped)`);
    res.status(200).json({ success: true, message: `Created ${results.created} colleges`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Schools from CSV
 * @route   POST /api/admin/bulk/schools
 */
export const bulkUploadSchools = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.schoolname;
        const code = (row.code || row.schoolcode || '').toUpperCase();
        const collegeCode = (row.collegecode || row.college || '').toUpperCase();
        const deanEmail = row.deanemail || row.dean || '';

        if (!name || !code || !collegeCode) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name, code, or collegeCode' });
          results.skipped++; continue;
        }

        const college = await College.findOne({ code: collegeCode });
        if (!college) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: `College "${collegeCode}" not found` });
          results.skipped++; continue;
        }

        const exists = await School.findOne({ code });
        if (exists) { results.skipped++; continue; }

        let deanId = null;
        if (deanEmail) {
          const deanUser = await User.findOne({ email: deanEmail.toLowerCase().trim() });
          if (deanUser) {
            deanUser.role = 'dean';
            deanUser.school = null;
            await deanUser.save();
            deanId = deanUser._id;
          }
        }

        await School.create({ name, code, college: college._id, dean: deanId });
        results.created++;
      } catch (err) {
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'SCHOOL', `Bulk uploaded ${results.created} schools`);
    res.status(200).json({ success: true, message: `Created ${results.created} schools`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Departments from CSV
 * @route   POST /api/admin/bulk/departments
 */
export const bulkUploadDepartments = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.departmentname;
        const code = (row.code || row.departmentcode || '').toUpperCase();
        const schoolCode = (row.schoolcode || row.school || '').toUpperCase();
        const hodEmail = row.hodemail || row.hod || '';

        if (!name || !code || !schoolCode) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name, code, or schoolCode' });
          results.skipped++; continue;
        }

        const school = await School.findOne({ code: schoolCode }).populate('college', '_id');
        if (!school) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: `School "${schoolCode}" not found` });
          results.skipped++; continue;
        }

        const exists = await Department.findOne({ code });
        if (exists) { results.skipped++; continue; }

        let hodId = null;
        if (hodEmail) {
          const hodUser = await User.findOne({ email: hodEmail.toLowerCase().trim() });
          if (hodUser) {
            hodUser.role = 'hod';
            hodUser.department = null;
            hodUser.school = school._id;
            hodUser.college = school.college?._id || null;
            await hodUser.save();
            hodId = hodUser._id;
          }
        }

        await Department.create({ name, code, school: school._id, hod: hodId });
        results.created++;
      } catch (err) {
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'DEPARTMENT', `Bulk uploaded ${results.created} departments`);
    res.status(200).json({ success: true, message: `Created ${results.created} departments`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Classes from CSV
 * @route   POST /api/admin/bulk/classes
 */
export const bulkUploadClasses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.classname;
        const code = (row.code || row.classcode || '').toUpperCase();
        const deptCode = (row.departmentcode || row.department || '').toUpperCase();
        const level = row.level || row.year || '1';
        const academicYear = row.academicyear || row.acyear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

        if (!name || !code || !deptCode) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name, code, or departmentCode' });
          results.skipped++; continue;
        }

        const dept = await Department.findOne({ code: deptCode });
        if (!dept) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: `Department "${deptCode}" not found` });
          results.skipped++; continue;
        }

        const exists = await Class.findOne({ code, academicYear });
        if (exists) { results.skipped++; continue; }

        await Class.create({
          name, code, department: dept._id,
          level: parseInt(level) || 1,
          academicYear: academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
        });
        results.created++;
      } catch (err) {
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'CLASS', `Bulk uploaded ${results.created} classes`);
    res.status(200).json({ success: true, message: `Created ${results.created} classes`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Courses from CSV
 * @route   POST /api/admin/bulk/courses
 */
export const bulkUploadCourses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.coursename;
        const code = (row.code || row.coursecode || '').toUpperCase();
        const classCode = (row.classcode || row.class || '').toUpperCase();
        const lecturerEmail = row.lectureremail || row.lecturer || '';
        const semester = row.semester || 'Semester 1';

        if (!name || !code || !classCode) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name, code, or classCode' });
          results.skipped++; continue;
        }

        const cls = await Class.findOne({ code: classCode });
        if (!cls) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: `Class "${classCode}" not found` });
          results.skipped++; continue;
        }

        const exists = await Course.findOne({ code, class: cls._id });
        if (exists) { results.skipped++; continue; }

        let lecturerId = null;
        if (lecturerEmail) {
          const lecturerUser = await User.findOne({ email: lecturerEmail.toLowerCase().trim() });
          if (lecturerUser) {
            if (lecturerUser.role !== 'lecturer') {
              lecturerUser.role = 'lecturer';
              await lecturerUser.save();
            }
            lecturerId = lecturerUser._id;
          }
        }

        await Course.create({ name, code, class: cls._id, lecturer: lecturerId, semester });
        results.created++;
      } catch (err) {
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'COURSE', `Bulk uploaded ${results.created} courses`);
    res.status(200).json({ success: true, message: `Created ${results.created} courses`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Students from CSV
 * @route   POST /api/admin/bulk/students
 */
export const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.studentname || row.fullname;
        const email = (row.email || row.studentemail || '').toLowerCase().trim();
        const password = row.password || 'Student@123';
        const phoneNumber = row.phonenumber || row.phone || '';
        const classCode = (row.classcode || row.class || '').toUpperCase();
        const level = row.level || row.year || '';

        if (!name || !email) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name or email' });
          results.skipped++; continue;
        }

        const existing = await User.findOne({ email });
        if (existing) { results.skipped++; continue; }

        const hashedPassword = await bcrypt.hash(password, 12);

        let resolvedDept = null;
        let resolvedSchool = null;
        let resolvedCollege = null;
        let resolvedLevel = level;
        let resolvedClassId = null;

        if (classCode) {
          const cls = await Class.findOne({ code: classCode }).populate({
            path: 'department',
            select: 'school',
            populate: { path: 'school', select: 'college' }
          });
          if (cls) {
            resolvedClassId = cls._id;
            resolvedDept = cls.department?._id || null;
            resolvedSchool = cls.department?.school?._id || null;
            resolvedCollege = cls.department?.school?.college || null;
            resolvedLevel = resolvedLevel || cls.level;
          }
        }

        if (!resolvedLevel) resolvedLevel = '1';

        const student = await User.create({
          name, email, password: hashedPassword,
          phoneNumber,
          role: 'student',
          status: 'ACTIVE',
          mustChangePassword: true,
          createdBy: req.user._id,
          classId: resolvedClassId,
          department: resolvedDept,
          school: resolvedSchool,
          college: resolvedCollege,
          level: resolvedLevel
        });

        if (resolvedClassId) {
          await Class.findByIdAndUpdate(resolvedClassId, { $addToSet: { students: student._id } });
        }

        results.created++;
      } catch (err) {
        if (err.code === 11000) { results.skipped++; continue; }
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'STUDENT', `Bulk uploaded ${results.created} students`);
    res.status(200).json({ success: true, message: `Created ${results.created} students`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Lecturers from CSV
 * @route   POST /api/admin/bulk/lecturers
 */
export const bulkUploadLecturers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.lecturername || row.fullname;
        const email = (row.email || row.lectureremail || '').toLowerCase().trim();
        const password = row.password || 'Lecturer@123';
        const phoneNumber = row.phonenumber || row.phone || '';
        const departmentCode = (row.departmentcode || row.department || '').toUpperCase();

        if (!name || !email) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name or email' });
          results.skipped++; continue;
        }

        const existing = await User.findOne({ email });
        if (existing) { results.skipped++; continue; }

        const hashedPassword = await bcrypt.hash(password, 12);

        let deptId = null;
        let schoolId = null;
        let collegeId = null;

        if (departmentCode) {
          const dept = await Department.findOne({ code: departmentCode }).populate({
            path: 'school',
            select: 'college'
          });
          if (dept) {
            deptId = dept._id;
            schoolId = dept.school?._id || null;
            collegeId = dept.school?.college || null;
          }
        }

        await User.create({
          name, email, password: hashedPassword,
          phoneNumber,
          role: 'lecturer',
          status: 'ACTIVE',
          createdBy: req.user._id,
          department: deptId,
          school: schoolId,
          college: collegeId
        });

        results.created++;
      } catch (err) {
        if (err.code === 11000) { results.skipped++; continue; }
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'LECTURER', `Bulk uploaded ${results.created} lecturers`);
    res.status(200).json({ success: true, message: `Created ${results.created} lecturers`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk upload Users from CSV
 * @route   POST /api/admin/bulk/users
 */
export const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });
    const rows = parseCSVBuffer(req.file.buffer);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'CSV file is empty' });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] };

    for (const raw of rows) {
      const row = lowerKeys(raw);
      try {
        const name = row.name || row.fullname;
        const email = (row.email || '').toLowerCase().trim();
        const password = row.password || 'User@123';
        const phoneNumber = row.phonenumber || row.phone || '';
        const role = (row.role || 'student').toLowerCase();
        const departmentCode = (row.departmentcode || row.department || '').toUpperCase();

        if (!name || !email) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: 'Missing name or email' });
          results.skipped++; continue;
        }

        const validRoles = ['student', 'lecturer', 'hod', 'dean', 'principal', 'admin', 'registrar', 'hr'];
        if (!validRoles.includes(role)) {
          results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: `Invalid role "${role}"` });
          results.skipped++; continue;
        }

        const existing = await User.findOne({ email });
        if (existing) { results.skipped++; continue; }

        const hashedPassword = await bcrypt.hash(password, 12);

        let deptId = null;
        let schoolId = null;
        let collegeId = null;

        if (departmentCode) {
          const dept = await Department.findOne({ code: departmentCode }).populate({
            path: 'school',
            select: 'college'
          });
          if (dept) {
            deptId = dept._id;
            schoolId = dept.school?._id || null;
            collegeId = dept.school?.college || null;
          }
        }

        await User.create({
          name, email, password: hashedPassword,
          phoneNumber,
          role,
          status: 'ACTIVE',
          createdBy: req.user._id,
          department: deptId,
          school: schoolId,
          college: collegeId
        });

        results.created++;
      } catch (err) {
        if (err.code === 11000) { results.skipped++; continue; }
        results.errors.push({ row: results.created + results.skipped + results.errors.length + 1, reason: err.message });
        results.skipped++;
      }
    }

    await logAuditAction(req.user._id, 'BULK_UPLOAD', null, 'USER', `Bulk uploaded ${results.created} users`);
    res.status(200).json({ success: true, message: `Created ${results.created} users`, ...results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};