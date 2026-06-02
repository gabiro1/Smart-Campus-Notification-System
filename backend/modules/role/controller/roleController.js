import Role from '../model/Role.js';
import AuditLog from '../../audit/models/AuditLog.js';

const logAudit = async (adminId, action, targetId, description, changes = {}) => {
  try {
    await AuditLog.create({
      adminId,
      action,
      targetId,
      targetType: 'ROLE',
      description,
      changes,
      status: 'SUCCESS'
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

export const getRoles = async (req, res) => {
  try {
    const { page = 1, limit = 50, getAll } = req.query;
    const filter = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (getAll === 'true') {
      const roles = await Role.find(filter).sort({ level: 1 });
      return res.json({ success: true, data: roles });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const roles = await Role.find(filter)
      .sort({ level: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Role.countDocuments(filter);

    res.json({
      success: true,
      data: roles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, displayName, level, description, permissions } = req.body;

    const existingName = await Role.findOne({ name: name.toLowerCase().trim() });
    if (existingName) {
      return res.status(400).json({ success: false, message: 'A role with this name already exists' });
    }

    const existingLevel = await Role.findOne({ level });
    if (existingLevel) {
      return res.status(400).json({ success: false, message: `Level ${level} is already assigned to another role` });
    }

    const role = await Role.create({
      name: name.toLowerCase().trim(),
      displayName,
      level,
      description,
      permissions: {
        canCreate: permissions?.canCreate || false,
        canApprove: permissions?.canApprove || false,
        dashboard: permissions?.dashboard || 'read-only',
        emergencyOverride: permissions?.emergencyOverride || false
      }
    });

    await logAudit(
      req.user._id,
      'CREATE_ROLE',
      role._id,
      `Created role "${role.displayName}" (${role.name}) at level ${role.level}`,
      { after: role.toObject() }
    );

    res.status(201).json({ success: true, data: role });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key error. Role name or level already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystem && req.body.name && req.body.name !== role.name) {
      return res.status(403).json({ success: false, message: 'Cannot rename a system role' });
    }

    const before = role.toObject();
    const { name, displayName, level, description, permissions, isActive } = req.body;

    if (name !== undefined && !role.isSystem) role.name = name.toLowerCase().trim();
    if (displayName !== undefined) role.displayName = displayName;
    if (level !== undefined) {
      const existingLevel = await Role.findOne({ level, _id: { $ne: role._id } });
      if (existingLevel) {
        return res.status(400).json({ success: false, message: `Level ${level} is already assigned to another role` });
      }
      role.level = level;
    }
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) {
      if (permissions.canCreate !== undefined) role.permissions.canCreate = permissions.canCreate;
      if (permissions.canApprove !== undefined) role.permissions.canApprove = permissions.canApprove;
      if (permissions.dashboard !== undefined) role.permissions.dashboard = permissions.dashboard;
      if (permissions.emergencyOverride !== undefined) role.permissions.emergencyOverride = permissions.emergencyOverride;
    }
    if (isActive !== undefined) role.isActive = isActive;

    const updated = await role.save();

    await logAudit(
      req.user._id,
      'UPDATE_ROLE',
      role._id,
      `Updated role "${updated.displayName}"`,
      { before, after: updated.toObject() }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key error. Role name or level already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(403).json({ success: false, message: 'System roles cannot be deleted' });
    }

    const User = (await import('../../user/model/User.js')).default;
    const usersWithRole = await User.countDocuments({ role: role.name });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role "${role.displayName}" because ${usersWithRole} user(s) are assigned to it. Reassign them first.`
      });
    }

    await logAudit(
      req.user._id,
      'DELETE_ROLE',
      role._id,
      `Deleted role "${role.displayName}" (${role.name})`,
      { before: role.toObject() }
    );

    await Role.findByIdAndDelete(role._id);

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
