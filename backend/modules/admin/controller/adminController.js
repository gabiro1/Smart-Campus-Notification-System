import User from "../../user/model/User.js";
import bcrypt from 'bcryptjs';
import Event from '../../event/model/Event.js';
import NotificationLog from '../../notification/models/NotificationLog.js';
import Reminder from '../../reminder/model/Reminder.js';
import AuditLog from '../../audit/models/AuditLog.js';
import Announcement from '../../announcement/model/Announcement.js';
import College from '../../college/model/College.js';
import School from '../../school/model/School.js';
import Department from '../../department/model/Department.js';
import SystemSettings from '../../settings/model/SystemSettings.js';
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

        // Validate role to prevent bad data
        const allowedRoles = ['student', 'admin', 'hod', 'lecturer', 'guild_president', 'dean', 'principal'];
        const userRole = role && allowedRoles.includes(role) ? role : 'student';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
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

// @desc    Get dashboard metrics
export const getDashboardMetrics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalReminders = await Reminder.countDocuments();
        const totalNotifications = await NotificationLog.countDocuments();

        // Get user breakdown by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Get user breakdown by school
        const usersBySchool = await User.aggregate([
            { $lookup: { from: 'schools', localField: 'school', foreignField: '_id', as: 'schoolData' } },
            { $unwind: { path: '$schoolData', preserveNullAndEmptyArrays: true } },
            { $group: { _id: '$schoolData.name', count: { $sum: 1 } } }
        ]);

        // Get notifications sent vs read
        const notificationStats = {
            total: totalNotifications,
            read: await NotificationLog.countDocuments({ status: 'read' }),
            unread: await NotificationLog.countDocuments({ status: 'unread' })
        };

        res.json({
            metrics: {
                totalUsers,
                totalEvents,
                totalReminders,
                totalNotifications
            },
            usersByRole,
            usersBySchool,
            notificationStats
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
        
        // Allowed admin to change role during full edit
        if (role) {
            const allowedRoles = ['student', 'admin', 'hod', 'lecturer', 'guild_president', 'dean', 'principal'];
            if (allowedRoles.includes(role)) {
                user.role = role;
            }
        }
        
        if (college) user.college = college; // <-- Added
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
        
        // ---------------------------------------------------------
        // THE FIX: Added 'dean' and 'principal' to the allowed array
        // ---------------------------------------------------------
        const allowedRoles = ['student', 'admin', 'hod', 'lecturer', 'guild_president', 'dean', 'principal'];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        res.json({
            message: "User role updated successfully",
            user
        });
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
                avgInterests: { $avg: { $size: '$interests' } }
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