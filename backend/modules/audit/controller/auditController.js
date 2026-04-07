import AuditLog from "../models/AuditLog.js";
import asyncHandler from "express-async-handler";

// @desc    Get all audit logs (admin only, with filters)
// @route   GET /api/admin/audit
// @access  Private (admin)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, targetType, adminId, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};

  if (action) filter.action = action;
  if (targetType) filter.targetType = targetType;

  // Handle adminId filter: can be ObjectId or email
  if (adminId) {
    if (adminId.includes('@')) {
      // Email search - find user by email first
      try {
        const User = (await import('../../../user/model/User.js')).default;
        const user = await User.findOne({ email: adminId }).select('_id');
        if (user) {
          filter.adminId = user._id;
        } else {
          // No user found, return empty results
          filter.adminId = null;
        }
      } catch (err) {
        console.error('[Audit] Error importing User model:', err.message);
      }
    } else {
      // Assume it's an ObjectId or partial string - we'll let MongoDB handle it
      // But we should check if it's a valid ObjectId format
      if (adminId.length === 24) {
        filter.adminId = adminId;
      } else {
        // Partial match not supported for adminId as it's an ObjectId field
        // We'll skip this filter or could use $in with query on User collection
        // For simplicity, we'll just ignore invalid ObjectId lengths
        console.warn(`[Audit] Invalid adminId length for ObjectId: ${adminId}`);
      }
    }
  }

  // Date range filtering
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start)) {
        filter.createdAt.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end)) {
        // Include the entire end day
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
  }

  const logs = await AuditLog.find(filter)
    .populate("adminId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await AuditLog.countDocuments(filter);

  res.status(200).json({
    success: true,
    logs,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    }
  });
});

// @desc    Get audit log by ID
// @route   GET /api/admin/audit/:id
// @access  Private (admin)
export const getAuditLog = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id)
    .populate("adminId", "name email")
    .populate("targetId", "name email");

  if (!log) {
    return res.status(404).json({ success: false, message: "Audit log not found" });
  }

  res.status(200).json({ success: true, data: log });
});

// @desc    Delete old audit logs (admin only, e.g., older than N days)
// @route   DELETE /api/admin/audit
// @access  Private (admin)
export const deleteOldAuditLogs = asyncHandler(async (req, res) => {
  const { days = 90 } = req.query;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(days));

  const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} audit logs older than ${days} days`
  });
});

// @desc    Create audit log (helper for internal use by middleware)
// @route   POST /api/admin/audit
// @access  Private (admin, or internal middleware - typically called by auditMiddleware)
export const createAuditLog = asyncHandler(async (req, res) => {
  const { action, targetId, targetType, description, changes, ipAddress, userAgent } = req.body;

  if (!action || !targetType || !description) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const log = await AuditLog.create({
    adminId: req.user?._id || req.user?.id || null,
    action,
    targetId,
    targetType,
    description,
    changes,
    ipAddress: ipAddress || req.ip,
    userAgent: userAgent || req.headers['user-agent'],
    status: 'SUCCESS'
  });

  res.status(201).json({ success: true, data: log });
});
