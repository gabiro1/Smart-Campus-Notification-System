import User from '../models/User.js';
import Event from '../models/Event.js';
import NotificationLog from '../models/NotificationLog.js';
import Reminder from '../models/Reminder.js';
import AuditLog from '../models/AuditLog.js';

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

// @desc    Create new user (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, school, department } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            school,
            department
        });

        await logAuditAction(
            req.user.id,
            'CREATE_USER',
            user._id,
            'USER',
            `Created new user ${user.name}`
        );

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
            { $group: { _id: '$school', count: { $sum: 1 } } }
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
        const { page = 1, limit = 20, role, school, department, search } = req.query;
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
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
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
        const { name, email, phoneNumber, school, department, level, notificationPreferences } = req.body;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const before = { ...user._doc };

        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (school) user.school = school;
        if (department) user.department = department;
        if (level) user.level = level;
        if (notificationPreferences) user.notificationPreferences = notificationPreferences;

        const updatedUser = await user.save();

        await logAuditAction(
            req.user.id,
            'UPDATE_USER',
            user._id,
            'USER',
            `Updated user ${user.name}`,
            { before, after: updatedUser._doc }
        );

        res.json({
            message: "User updated successfully",
            user: updatedUser.toObject({ virtuals: true })
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

        await logAuditAction(
            req.user.id,
            'DELETE_USER',
            user._id,
            'USER',
            `Deleted user ${userName}`
        );

        res.json({
            message: "User and all associated data deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Promote user role
export const promoteUser = async (req, res) => {
    try {
        const { role } = req.body;
        const allowedRoles = ['student', 'admin', 'hod', 'lecturer', 'guild_president'];

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

        await logAuditAction(
            req.user.id,
            'PROMOTE_USER',
            user._id,
            'USER',
            `Promoted ${user.name} from ${oldRole} to ${role}`
        );

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
