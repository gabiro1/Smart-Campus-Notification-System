import NotificationLog from '../../notification/models/NotificationLog.js';
import Announcement from '../../announcement/model/Announcement.js';

// @desc    Get read receipt analytics for a specific announcement
// @route   GET /api/analytics/announcements/:id
// @access  Private (Lecturer/HoD must own the announcement or be admin)
export const getAnnouncementAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Validate announcement ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid announcement ID" });
    }

    // Fetch the announcement with authorization check
    const announcement = await Announcement.findById(id)
      .populate('lecturer', '_id')
      .populate('targetClass', '_id');

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    // Authorization: Only the lecturer who posted, or HOD/Dean/Admin of the same department can view analytics
    const isOwner = announcement.lecturer?._id?.toString() === userId.toString();
    const isAdmin = ['hod', 'dean', 'admin'].includes(userRole);
    const sameDepartment = announcement.lecturer?.department?.toString() === req.user?.department?.toString();

    if (!isOwner && !(isAdmin && sameDepartment)) {
      return res.status(403).json({ success: false, message: "Not authorized to view these analytics" });
    }

    // Aggregate notification logs for this announcement
    const stats = await NotificationLog.aggregate([
      { $match: { referenceId: id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Build stats object
    const result = {
      totalSent: 0,
      delivered: 0,
      read: 0,
      unread: 0,
      readRate: 0,
      deliveryRate: 0
    };

    // Sum up counts by status
    stats.forEach(stat => {
      const { _id: status, count } = stat;
      result.totalSent += count;

      switch (status) {
        case 'delivered':
          result.delivered = count;
          break;
        case 'read':
          result.read = count;
          break;
        case 'unread':
          result.unread = count;
          break;
        case 'sent':
          // 'sent' means dispatched but not yet delivered/read
          result.delivered += count; // Treat as delivered for our purposes
          break;
      }
    });

    // Calculate percentages
    if (result.totalSent > 0) {
      result.readRate = parseFloat(((result.read / result.totalSent) * 100).toFixed(1));
      result.deliveryRate = parseFloat(((result.delivered / result.totalSent) * 100).toFixed(1));
    }

    // Include announcement metadata
    result.announcement = {
      id: announcement._id,
      title: announcement.title,
      createdAt: announcement.createdAt,
      type: announcement.type,
      requiresAcknowledgment: announcement.requiresAcknowledgment
    };

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("[Analytics] Failed to fetch announcement analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get detailed breakdown by student (optional enhancement)
// @route   GET /api/analytics/announcements/:id/recipients
// @access  Private (Admin/HOD only)
export const getAnnouncementRecipientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, status } = req.query;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Authorization: Only admin-level users can see recipient details
    if (!['hod', 'dean', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Build query
    const query = { referenceId: id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Get recipient logs with user details
    const logs = await NotificationLog.find(query)
      .populate('studentId', 'name email studentID')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await NotificationLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });

  } catch (error) {
    console.error("[Analytics] Failed to fetch recipient details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipient details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
