import { GuildPresident, GuildCouncil, ClassRepresentative } from '../models/StudentLeadership.js';
import User from '../../user/model/User.js';
import AuditLog from '../../audit/models/AuditLog.js';
import bcrypt from 'bcryptjs';

const logAudit = async (adminId, action, targetId, targetType, description, metadata = {}) => {
  try {
    await AuditLog.create({ adminId, action, targetId, targetType, description, status: 'SUCCESS', metadata });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

const getCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  return month >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
};

export const submitElectionResult = async (req, res) => {
  try {
    const { userId, electionId, voteCount, totalVotes } = req.body;

    if (!userId || !electionId) {
      return res.status(400).json({ success: false, message: 'userId and electionId are required' });
    }

    const candidate = await User.findById(userId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate user not found' });
    }

    const existingElection = await GuildPresident.findOne({ electionId });
    if (existingElection) {
      return res.status(409).json({ success: false, message: 'Election result already submitted for this election' });
    }

    const existingActive = await GuildPresident.findOne({ status: 'ACTIVE' });
    if (existingActive) {
      return res.status(400).json({ success: false, message: 'There is already an active Guild President. Suspend them first.' });
    }

    const result = await GuildPresident.create({
      userId,
      electionId,
      voteCount: voteCount || 0,
      totalVotes: totalVotes || 0,
      academicYear: getCurrentAcademicYear(),
      status: 'PENDING_APPROVAL',
      submittedBy: req.user._id,
    });

    await logAudit(req.user._id, 'CREATE_STAFF_DRAFT', result._id, 'STAFF_DRAFT',
      `Election result submitted for ${candidate.name} (${electionId})`,
      { electionId, voteCount, totalVotes }
    );

    return res.status(201).json({ success: true, message: 'Election result submitted for principal approval', data: result });
  } catch (error) {
    console.error('submitElectionResult Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingElections = async (req, res) => {
  try {
    const results = await GuildPresident.find({ status: 'PENDING_APPROVAL' })
      .populate('userId', 'name email studentID')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getElectionHistory = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const results = await GuildPresident.find(query)
      .populate('userId', 'name email studentID')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await GuildPresident.findById(id).populate('userId');

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election result not found' });
    }
    if (election.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: `Election is already ${election.status}` });
    }

    if (election.userId._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Principal cannot approve their own election result' });
    }

    const currentActive = await GuildPresident.findOne({ status: 'ACTIVE' });
    if (currentActive) {
      currentActive.status = 'SUSPENDED';
      await currentActive.save();
    }

    election.status = 'ACTIVE';
    election.approvedBy = req.user._id;
    election.approvedAt = new Date();
    await election.save();

    const user = await User.findById(election.userId._id);
    if (user && user.role !== 'guild_president') {
      user.role = 'guild_president';
      await user.save();
    }

    await logAudit(req.user._id, 'APPROVE_ROLE_ASSIGNMENT', election._id, 'ROLE_ASSIGNMENT',
      `Approved Guild President election for ${election.userId.name}`,
      { electionId: election.electionId, voteCount: election.voteCount }
    );

    return res.status(200).json({ success: true, message: 'Guild President election approved and activated', data: election });
  } catch (error) {
    console.error('approveElection Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const election = await GuildPresident.findById(id).populate('userId');
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election result not found' });
    }
    if (election.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: `Election is already ${election.status}` });
    }

    election.status = 'REJECTED';
    election.rejectionReason = reason || 'No reason provided';
    election.approvedBy = req.user._id;
    election.approvedAt = new Date();
    await election.save();

    await logAudit(req.user._id, 'REJECT_ROLE_ASSIGNMENT', election._id, 'ROLE_ASSIGNMENT',
      `Rejected Guild President election for ${election.userId.name}: ${election.rejectionReason}`,
      { electionId: election.electionId }
    );

    return res.status(200).json({ success: true, message: 'Election result rejected', data: election });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveGuildPresident = async (req, res) => {
  try {
    const gp = await GuildPresident.findOne({ status: 'ACTIVE' })
      .populate('userId', 'name email studentID')
      .populate('approvedBy', 'name email');

    return res.status(200).json({ success: true, data: gp });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendGuildPresident = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const gp = await GuildPresident.findById(id).populate('userId');
    if (!gp) {
      return res.status(404).json({ success: false, message: 'Guild President record not found' });
    }
    if (gp.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Guild President is not currently active' });
    }

    gp.status = 'SUSPENDED';
    gp.rejectionReason = reason || 'Suspended by principal';
    await gp.save();

    const user = await User.findById(gp.userId._id);
    if (user && user.role === 'guild_president') {
      user.role = 'student';
      await user.save();
    }

    await logAudit(req.user._id, 'EMERGENCY_OVERRIDE', gp._id, 'ROLE_ASSIGNMENT',
      `Suspended Guild President ${gp.userId.name}: ${reason || 'No reason'}`,
      { reason }
    );

    return res.status(200).json({ success: true, message: 'Guild President suspended', data: gp });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const proposeClassRep = async (req, res) => {
  try {
    const { userId, classId, courseId, departmentId } = req.body;

    if (!userId || !classId) {
      return res.status(400).json({ success: false, message: 'userId and classId are required' });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const activeGP = await GuildPresident.findOne({ status: 'ACTIVE' });
    if (!activeGP) {
      return res.status(400).json({ success: false, message: 'No active Guild President. Elections must be held first.' });
    }

    if (req.user._id.toString() !== activeGP.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the active Guild President can propose Class Representatives' });
    }

    const existingCP = await ClassRepresentative.findOne({
      classId,
      academicYear: getCurrentAcademicYear(),
      status: { $in: ['PENDING', 'ACTIVE'] }
    });
    if (existingCP) {
      return res.status(409).json({
        success: false,
        message: 'This class already has a pending or active Class Representative this academic year'
      });
    }

    if (userId.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Guild President cannot propose themselves as Class Representative' });
    }

    const cp = await ClassRepresentative.create({
      userId,
      classId,
      courseId: courseId || null,
      departmentId: departmentId || null,
      proposedBy: req.user._id,
      status: 'PENDING',
      academicYear: getCurrentAcademicYear(),
    });

    await logAudit(req.user._id, 'CREATE_STAFF_DRAFT', cp._id, 'STAFF_DRAFT',
      `Class Representative proposed for ${student.name} in class ${classId}`,
      { classId }
    );

    return res.status(201).json({ success: true, message: 'Class Representative proposal submitted for HOD approval', data: cp });
  } catch (error) {
    console.error('proposeClassRep Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingClassReps = async (req, res) => {
  try {
    const cps = await ClassRepresentative.find({ status: 'PENDING' })
      .populate('userId', 'name email studentID representedLevel representedDepartment')
      .populate('proposedBy', 'name email')
      .populate('classId', 'name code')
      .populate('courseId', 'name code')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: cps });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllClassReps = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const cps = await ClassRepresentative.find(query)
      .populate('userId', 'name email studentID representedLevel representedDepartment')
      .populate('proposedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('classId', 'name code')
      .populate('courseId', 'name code')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: cps });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    const cps = await ClassRepresentative.find({ proposedBy: req.user._id })
      .populate('userId', 'name email studentID representedLevel representedDepartment')
      .populate('approvedBy', 'name email')
      .populate('classId', 'name code')
      .populate('courseId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: cps });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveClassRep = async (req, res) => {
  try {
    const { id } = req.params;
    const cp = await ClassRepresentative.findById(id).populate('userId').populate('classId');

    if (!cp) {
      return res.status(404).json({ success: false, message: 'Class Representative proposal not found' });
    }
    if (cp.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Proposal is already ${cp.status}` });
    }

    if (cp.userId._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'HOD cannot approve their own Class Representative proposal' });
    }

    cp.status = 'ACTIVE';
    cp.approvedBy = req.user._id;
    cp.approvedAt = new Date();
    await cp.save();

    const user = await User.findById(cp.userId._id);
    if (user && user.role !== 'class_rep') {
      user.role = 'class_rep';
      await user.save();
    }

    await logAudit(req.user._id, 'APPROVE_ROLE_ASSIGNMENT', cp._id, 'ROLE_ASSIGNMENT',
      `Approved Class Representative ${cp.userId.name} for ${cp.classId?.name || cp.classId}`,
      {}
    );

    return res.status(200).json({ success: true, message: 'Class Representative approved and activated', data: cp });
  } catch (error) {
    console.error('approveClassRep Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectClassRep = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cp = await ClassRepresentative.findById(id).populate('userId');
    if (!cp) {
      return res.status(404).json({ success: false, message: 'Class Representative proposal not found' });
    }
    if (cp.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Proposal is already ${cp.status}` });
    }

    cp.status = 'REJECTED';
    cp.rejectionReason = reason || 'Rejected by HOD';
    cp.approvedBy = req.user._id;
    cp.approvedAt = new Date();
    await cp.save();

    await logAudit(req.user._id, 'REJECT_ROLE_ASSIGNMENT', cp._id, 'ROLE_ASSIGNMENT',
      `Rejected Class Representative ${cp.userId.name}: ${cp.rejectionReason}`,
      {}
    );

    return res.status(200).json({ success: true, message: 'Class Representative proposal rejected', data: cp });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeadershipStats = async (req, res) => {
  try {
    const activeGP = await GuildPresident.findOne({ status: 'ACTIVE' }).populate('userId', 'name email studentID');
    const pendingElections = await GuildPresident.countDocuments({ status: 'PENDING_APPROVAL' });
    const pendingCouncils = await GuildCouncil.countDocuments({ status: 'PENDING_APPROVAL' });
    const activeCPs = await ClassRepresentative.countDocuments({ status: 'ACTIVE' });
    const pendingCPs = await ClassRepresentative.countDocuments({ status: 'PENDING' });
    const totalCPs = await ClassRepresentative.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        activeGuildPresident: activeGP,
        pendingElections,
        pendingCouncils,
        activeClassReps: activeCPs,
        pendingClassReps: pendingCPs,
        totalClassReps: totalCPs,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitCouncilElection = async (req, res) => {
  try {
    const { electionId, positions, voterTurnout, eligibleVoters } = req.body;

    if (!electionId || !positions || !Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ success: false, message: 'electionId and positions array are required' });
    }

    for (const pos of positions) {
      if (!pos.title || !pos.userId) {
        return res.status(400).json({ success: false, message: 'Each position must have a title and userId' });
      }
    }

    const existing = await GuildCouncil.findOne({ electionId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Council election already submitted for this election ID' });
    }

    const existingActive = await GuildCouncil.findOne({ status: 'ACTIVE' });
    if (existingActive) {
      return res.status(400).json({ success: false, message: 'There is already an active Guild Council. Suspend it first.' });
    }

    const userIds = positions.map(p => p.userId);
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== new Set(userIds).size) {
      return res.status(400).json({ success: false, message: 'One or more candidate users not found' });
    }

    const result = await GuildCouncil.create({
      electionId,
      academicYear: getCurrentAcademicYear(),
      positions: positions.map(p => ({
        title: p.title,
        userId: p.userId,
        voteCount: p.voteCount || 0,
        totalVotes: p.totalVotes || 0,
        runnerUp: p.runnerUp || '',
      })),
      voterTurnout: voterTurnout || 0,
      eligibleVoters: eligibleVoters || 0,
      status: 'PENDING_APPROVAL',
      submittedBy: req.user._id,
    });

    await logAudit(req.user._id, 'CREATE_STAFF_DRAFT', result._id, 'STAFF_DRAFT',
      `Council election submitted: ${electionId} with ${positions.length} positions`,
      { electionId, positionCount: positions.length }
    );

    return res.status(201).json({ success: true, message: 'Council election submitted for principal approval', data: result });
  } catch (error) {
    console.error('submitCouncilElection Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingCouncilElections = async (req, res) => {
  try {
    const results = await GuildCouncil.find({ status: 'PENDING_APPROVAL' })
      .populate('positions.userId', 'name email studentID')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCouncilHistory = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const results = await GuildCouncil.find(query)
      .populate('positions.userId', 'name email studentID')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveCouncil = async (req, res) => {
  try {
    const council = await GuildCouncil.findOne({ status: 'ACTIVE' })
      .populate('positions.userId', 'name email studentID')
      .populate('approvedBy', 'name email');

    return res.status(200).json({ success: true, data: council });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveCouncilElection = async (req, res) => {
  try {
    const { id } = req.params;
    const council = await GuildCouncil.findById(id).populate('positions.userId');

    if (!council) {
      return res.status(404).json({ success: false, message: 'Council election not found' });
    }
    if (council.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: `Council is already ${council.status}` });
    }

    const currentActive = await GuildCouncil.findOne({ status: 'ACTIVE' });
    if (currentActive) {
      currentActive.status = 'SUSPENDED';
      await currentActive.save();
    }

    const currentActiveGP = await GuildPresident.findOne({ status: 'ACTIVE' });
    if (currentActiveGP) {
      currentActiveGP.status = 'SUSPENDED';
      await currentActiveGP.save();
    }

    council.status = 'ACTIVE';
    council.approvedBy = req.user._id;
    council.approvedAt = new Date();
    await council.save();

    const presidentPos = council.positions.find(p => p.title.toLowerCase() === 'president');
    if (presidentPos) {
      const user = await User.findById(presidentPos.userId._id);
      if (user && user.role !== 'guild_president') {
        user.role = 'guild_president';
        await user.save();
      }

      const existingGP = await GuildPresident.findOne({ userId: presidentPos.userId._id, status: 'ACTIVE' });
      if (!existingGP) {
        await GuildPresident.create({
          userId: presidentPos.userId._id,
          electionId: council.electionId + '-PRESIDENT',
          voteCount: presidentPos.voteCount,
          totalVotes: presidentPos.totalVotes,
          academicYear: council.academicYear,
          status: 'ACTIVE',
          approvedBy: req.user._id,
          approvedAt: new Date(),
          submittedBy: council.submittedBy,
        });
      }
    }

    await logAudit(req.user._id, 'APPROVE_ROLE_ASSIGNMENT', council._id, 'ROLE_ASSIGNMENT',
      `Approved Guild Council election ${council.electionId} with ${council.positions.length} positions`,
      { electionId: council.electionId, positions: council.positions.map(p => p.title) }
    );

    return res.status(200).json({ success: true, message: 'Guild Council election approved and activated', data: council });
  } catch (error) {
    console.error('approveCouncilElection Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectCouncilElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const council = await GuildCouncil.findById(id).populate('positions.userId');
    if (!council) {
      return res.status(404).json({ success: false, message: 'Council election not found' });
    }
    if (council.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: `Council is already ${council.status}` });
    }

    council.status = 'REJECTED';
    council.rejectionReason = reason || 'No reason provided';
    council.approvedBy = req.user._id;
    council.approvedAt = new Date();
    await council.save();

    await logAudit(req.user._id, 'REJECT_ROLE_ASSIGNMENT', council._id, 'ROLE_ASSIGNMENT',
      `Rejected Guild Council election ${council.electionId}: ${council.rejectionReason}`,
      { electionId: council.electionId }
    );

    return res.status(200).json({ success: true, message: 'Council election rejected', data: council });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendCouncil = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const council = await GuildCouncil.findById(id).populate('positions.userId');
    if (!council) {
      return res.status(404).json({ success: false, message: 'Council record not found' });
    }
    if (council.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Council is not currently active' });
    }

    council.status = 'SUSPENDED';
    council.rejectionReason = reason || 'Suspended by principal';
    await council.save();

    const presidentPos = council.positions.find(p => p.title.toLowerCase() === 'president');
    if (presidentPos) {
      const user = await User.findById(presidentPos.userId._id);
      if (user && user.role === 'guild_president') {
        user.role = 'student';
        await user.save();
      }

      const activeGP = await GuildPresident.findOne({ userId: presidentPos.userId._id, status: 'ACTIVE' });
      if (activeGP) {
        activeGP.status = 'SUSPENDED';
        await activeGP.save();
      }
    }

    await logAudit(req.user._id, 'EMERGENCY_OVERRIDE', council._id, 'ROLE_ASSIGNMENT',
      `Suspended Guild Council ${council.electionId}: ${reason || 'No reason'}`,
      { reason }
    );

    return res.status(200).json({ success: true, message: 'Guild Council suspended', data: council });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
