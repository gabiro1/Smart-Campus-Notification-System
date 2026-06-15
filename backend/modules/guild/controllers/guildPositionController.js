import GuildPosition, { ensureDefaultGuildPositions } from '../models/GuildPosition.js';
import User from '../../user/model/User.js';
import AuditLog from '../../audit/models/AuditLog.js';

const logAudit = async (adminId, action, targetId, targetType, description) => {
  try {
    await AuditLog.create({ adminId, action, targetId, targetType, description, status: 'SUCCESS' });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

// GET /api/guild-positions
export const getGuildPositions = async (req, res) => {
  try {
    await ensureDefaultGuildPositions();
    const positions = await GuildPosition.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: positions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/guild-positions  { name }
export const addGuildPosition = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Position name is required' });
    }

    const existing = await GuildPosition.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This position already exists' });
    }

    const position = await GuildPosition.create({ name: name.trim(), isPresident: false });

    await logAudit(req.user._id, 'UPDATE_USER', position._id, 'ROLE',
      `Added new guild council position: ${position.name}`);

    return res.status(201).json({ success: true, message: 'Position added', data: position });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/guild-positions/:id
export const deleteGuildPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await GuildPosition.findById(id);
    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }
    if (position.isPresident) {
      return res.status(400).json({ success: false, message: 'The Guild President position cannot be removed' });
    }

    const holders = await User.countDocuments({ guildPosition: position.name });
    if (holders > 0) {
      return res.status(400).json({ success: false, message: 'Cannot remove a position that is currently assigned to a student' });
    }

    await GuildPosition.findByIdAndDelete(id);

    await logAudit(req.user._id, 'UPDATE_USER', id, 'ROLE',
      `Removed guild council position: ${position.name}`);

    return res.status(200).json({ success: true, message: 'Position removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/guild-positions/members
export const getGuildMembers = async (req, res) => {
  try {
    const members = await User.find({ guildPosition: { $ne: null } })
      .select('name email registrationNumber role guildPosition department school college')
      .sort({ guildPosition: 1 });

    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/guild-positions/assign  { registrationNumber, position }
// Immediately assigns a guild council position to a student — no approval required.
export const assignGuildPosition = async (req, res) => {
  try {
    const { registrationNumber, position } = req.body;
    if (!registrationNumber || !position) {
      return res.status(400).json({ success: false, message: 'registrationNumber and position are required' });
    }

    const student = await User.findOne({ registrationNumber: registrationNumber.trim() });
    if (!student) {
      return res.status(404).json({ success: false, message: 'No student found with this registration number' });
    }

    const positionDoc = await GuildPosition.findOne({ name: position });
    if (!positionDoc) {
      return res.status(400).json({ success: false, message: 'Unknown guild council position' });
    }

    if (positionDoc.isPresident) {
      // Only one Guild President at a time — demote the current holder.
      const currentPresident = await User.findOne({ guildPosition: positionDoc.name });
      if (currentPresident && currentPresident._id.toString() !== student._id.toString()) {
        currentPresident.guildPosition = null;
        if (currentPresident.role === 'guild_president') {
          currentPresident.role = 'student';
        }
        await currentPresident.save();
      }
      student.role = 'guild_president';
    }

    // If this student already held a different position, that slot is now free implicitly.
    student.guildPosition = positionDoc.name;
    await student.save();

    await logAudit(req.user._id, 'PROMOTE_USER', student._id, 'USER',
      `Assigned guild council position "${positionDoc.name}" to ${student.name} (${student.registrationNumber})`);

    return res.status(200).json({
      success: true,
      message: `${student.name} has been assigned as ${positionDoc.name}`,
      data: student,
    });
  } catch (error) {
    console.error('assignGuildPosition Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/guild-positions/remove/:userId
export const removeGuildPosition = async (req, res) => {
  try {
    const { userId } = req.params;
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    if (!student.guildPosition) {
      return res.status(400).json({ success: false, message: 'This student does not hold a guild council position' });
    }

    const previousPosition = student.guildPosition;
    student.guildPosition = null;
    if (student.role === 'guild_president') {
      student.role = 'student';
    }
    await student.save();

    await logAudit(req.user._id, 'PROMOTE_USER', student._id, 'USER',
      `Removed guild council position "${previousPosition}" from ${student.name} (${student.registrationNumber})`);

    return res.status(200).json({ success: true, message: 'Guild council position removed', data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
