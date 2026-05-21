import Report from '../model/Report.js';
import AuditLog from '../../audit/models/AuditLog.js';
import fs from 'fs/promises';
import path from 'path';

const addLifecycleEntry = (report, action, user, comments = '', previousStatus = null, newStatus = null) => {
  report.lifecycle.push({
    action,
    actor: user._id,
    actorRole: user.role,
    actorName: user.name || user.email,
    timestamp: new Date(),
    comments,
    previousStatus,
    newStatus,
  });
};

const logAudit = async (user, action, report, description, extra = {}) => {
  try {
    await AuditLog.create({
      adminId: user._id,
      action,
      targetId: report._id,
      targetType: 'REPORT',
      description,
      changes: { title: report.title, status: report.status, ...extra },
      status: 'SUCCESS',
    });
  } catch (err) {
    console.error('[Report Audit] Failed to log:', err.message);
  }
};

// ──────────────────────────────────────────
// CREATE (draft)
// ──────────────────────────────────────────
const parseJSONField = (val) => {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
};

const handleFileUploads = async (files) => {
  const attachments = [];
  if (files && files.length > 0) {
    const uploadDir = path.join(process.cwd(), "uploads", "reports");
    try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

    for (const file of files) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = `report-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, file.buffer);
      attachments.push({
        name: file.originalname,
        url: `/uploads/reports/${filename}`,
        uploadedAt: new Date(),
      });
    }
  }
  return attachments;
};

export const createReport = async (req, res) => {
  try {
    const body = req.body;
    const reportingPeriod = parseJSONField(body.reportingPeriod);
    const metrics = parseJSONField(body.metrics);
    const riskFlags = parseJSONField(body.riskFlags);

    if (!body.title || !reportingPeriod?.start || !reportingPeriod?.end) {
      return res.status(400).json({ success: false, message: 'Title and reporting period are required.' });
    }

    const attachments = await handleFileUploads(req.files);

    const report = await Report.create({
      title: body.title,
      summary: body.summary || '',
      reportingPeriod: {
        start: new Date(reportingPeriod.start),
        end: new Date(reportingPeriod.end),
        label: reportingPeriod.label || '',
      },
      metrics: metrics || [],
      notes: body.notes || '',
      attachments,
      status: 'draft',
      authorId: req.user._id,
      authorRole: req.user.role,
      authorName: req.user.name || req.user.email,
      departmentId: body.departmentId || req.user.department,
      departmentName: body.departmentName || '',
      schoolId: req.user.school || null,
      lifecycle: [],
      riskFlags: riskFlags || [],
    });

    addLifecycleEntry(report, 'created', req.user, 'Report created in draft state');
    await report.save();

    await logAudit(req.user, 'CREATE_REPORT', report, `Report "${report.title}" created as draft`);

    res.status(201).json({ success: true, message: 'Report created as draft.', data: report });
  } catch (error) {
    console.error('[Report] Create error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// SUBMIT (draft → submitted)
// ──────────────────────────────────────────
export const submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'draft' && report.status !== 'revision_requested') {
      return res.status(400).json({ success: false, message: `Cannot submit report in "${report.status}" state.` });
    }
    if (report.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the author can submit this report.' });
    }

    const previousStatus = report.status;
    report.status = 'submitted';
    addLifecycleEntry(report, 'submitted', req.user, 'Report submitted for review', previousStatus, 'submitted');
    await report.save();

    await logAudit(req.user, 'SUBMIT_REPORT', report, `Report "${report.title}" submitted for review`);

    res.json({ success: true, message: 'Report submitted for review.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// GET REPORTS SUBMITTED FOR DEAN REVIEW
// ──────────────────────────────────────────
export const getPendingReview = async (req, res) => {
  try {
    const role = req.user.role;
    let query = { status: 'submitted' };

    if (role === 'dean' && req.user.school) {
      query.schoolId = req.user.school;
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email')
      .lean();

    const counts = {
      pending_review: reports.filter(r => r.status === 'submitted').length,
      under_review: reports.filter(r => r.status === 'under_review').length,
      total: reports.length,
    };

    res.json({ success: true, data: reports, counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// GET ALL APPROVED REPORTS (for analytics)
// ──────────────────────────────────────────
export const getApprovedReports = async (req, res) => {
  try {
    const { department, school, from, to } = req.query;
    const query = { status: 'acknowledged' };

    if (department) query.departmentId = department;
    if (school) query.schoolId = school;
    if (from || to) {
      query['reportingPeriod.start'] = {};
      if (from) query['reportingPeriod.start'].$gte = new Date(from);
      if (to) query['reportingPeriod.end'] = { $lte: new Date(to) };
    }

    const reports = await Report.find(query)
      .sort({ acknowledgedAt: -1 })
      .populate('acknowledgedBy', 'name')
      .lean();

    res.json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// GET SINGLE REPORT
// ──────────────────────────────────────────
export const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('authorId', 'name email')
      .populate('reviewedBy', 'name')
      .populate('acknowledgedBy', 'name')
      .lean();

    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// GET REPORTS FOR DEPARTMENT (author's own)
// ──────────────────────────────────────────
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ authorId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// UPDATE DRAFT
// ──────────────────────────────────────────
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the author can update this report.' });
    }
    if (report.status !== 'draft' && report.status !== 'revision_requested') {
      return res.status(400).json({ success: false, message: 'Can only update draft or revision-requested reports.' });
    }

    const body = req.body;
    if (body.title) report.title = body.title;
    if (body.summary !== undefined) report.summary = body.summary;
    const reportingPeriod = parseJSONField(body.reportingPeriod);
    if (reportingPeriod) {
      if (reportingPeriod.start) report.reportingPeriod.start = reportingPeriod.start;
      if (reportingPeriod.end) report.reportingPeriod.end = reportingPeriod.end;
      if (reportingPeriod.label) report.reportingPeriod.label = reportingPeriod.label;
    }
    const metrics = parseJSONField(body.metrics);
    if (metrics) report.metrics = metrics;
    if (body.notes !== undefined) report.notes = body.notes;

    const riskFlags = parseJSONField(body.riskFlags);
    if (riskFlags) report.riskFlags = riskFlags;

    const newAttachments = await handleFileUploads(req.files);
    if (newAttachments.length > 0) {
      report.attachments = [...(report.attachments || []), ...newAttachments];
    }

    addLifecycleEntry(report, 'note_added', req.user, 'Report updated');
    await report.save();

    res.json({ success: true, message: 'Report updated.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// DEAN: START REVIEW (submitted → under_review)
// ──────────────────────────────────────────
export const startReview = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Report must be in submitted state to start review.' });
    }

    const previousStatus = report.status;
    report.status = 'under_review';
    report.reviewedBy = req.user._id;
    addLifecycleEntry(report, 'under_review', req.user, 'Review started', previousStatus, 'under_review');
    await report.save();

    await logAudit(req.user, 'UPDATE_REPORT', report, `Review started for report "${report.title}"`);

    res.json({ success: true, message: 'Review started.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// DEAN: APPROVE REPORT (under_review → approved)
// ──────────────────────────────────────────
export const approveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'under_review') {
      return res.status(400).json({ success: false, message: 'Report must be under review to approve.' });
    }

    const previousStatus = report.status;
    report.status = 'approved';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.reviewComments = req.body.comments || '';
    addLifecycleEntry(report, 'approved', req.user, req.body.comments || 'Report approved', previousStatus, 'approved');
    await report.save();

    await logAudit(req.user, 'UPDATE_REPORT', report, `Report "${report.title}" approved by ${req.user.name}`);

    res.json({ success: true, message: 'Report approved.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// DEAN: REJECT REPORT (under_review → rejected)
// ──────────────────────────────────────────
export const rejectReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'under_review') {
      return res.status(400).json({ success: false, message: 'Report must be under review to reject.' });
    }

    const previousStatus = report.status;
    report.status = 'rejected';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.reviewComments = req.body.comments || '';
    addLifecycleEntry(report, 'rejected', req.user, req.body.comments || 'Report rejected', previousStatus, 'rejected');
    await report.save();

    await logAudit(req.user, 'UPDATE_REPORT', report, `Report "${report.title}" rejected`);

    res.json({ success: true, message: 'Report rejected.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// DEAN: REQUEST REVISION (under_review → revision_requested)
// ──────────────────────────────────────────
export const requestRevision = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'under_review') {
      return res.status(400).json({ success: false, message: 'Report must be under review to request revision.' });
    }
    if (!req.body.comments) {
      return res.status(400).json({ success: false, message: 'Revision comments are required.' });
    }

    const previousStatus = report.status;
    report.status = 'revision_requested';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.revisionRequest = req.body.comments;
    addLifecycleEntry(report, 'revision_requested', req.user, req.body.comments, previousStatus, 'revision_requested');
    await report.save();

    await logAudit(req.user, 'UPDATE_REPORT', report, `Revision requested for report "${report.title}"`);

    res.json({ success: true, message: 'Revision requested. Department can resubmit.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// DEAN: ACKNOWLEDGE REPORT (approved → acknowledged)
// ──────────────────────────────────────────
export const acknowledgeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved reports can be acknowledged.' });
    }

    const previousStatus = report.status;
    report.status = 'acknowledged';
    report.acknowledgedBy = req.user._id;
    report.acknowledgedAt = new Date();
    addLifecycleEntry(report, 'acknowledged', req.user, req.body.comments || 'Report acknowledged', previousStatus, 'acknowledged');
    await report.save();

    await logAudit(req.user, 'UPDATE_REPORT', report, `Report "${report.title}" acknowledged by ${req.user.name}`);

    res.json({ success: true, message: 'Report acknowledged. Data is now included in institutional analytics.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// DEAN: ESCALATE REPORT
// ──────────────────────────────────────────
export const escalateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.status !== 'submitted' && report.status !== 'under_review') {
      return res.status(400).json({ success: false, message: 'Cannot escalate report in current state.' });
    }
    if (!req.body.comments) {
      return res.status(400).json({ success: false, message: 'Escalation reason is required.' });
    }

    report.escalatedTo = req.user._id;
    report.escalatedAt = new Date();
    report.escalationReason = req.body.comments;
    addLifecycleEntry(report, 'escalated', req.user, req.body.comments, report.status, report.status);
    await report.save();

    await logAudit(req.user, 'UPDATE_REPORT', report, `Report "${report.title}" escalated`);

    res.json({ success: true, message: 'Report escalated.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// ADD NOTE
// ──────────────────────────────────────────
export const addNote = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (!req.body.comments) return res.status(400).json({ success: false, message: 'Note content is required.' });

    addLifecycleEntry(report, 'note_added', req.user, req.body.comments);
    await report.save();

    res.json({ success: true, message: 'Note added.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ──────────────────────────────────────────
// GET ANALYTICS DATA (approved + acknowledged only)
// ──────────────────────────────────────────
// ──────────────────────────────────────────
// UPLOAD ATTACHMENTS (to any editable report)
// ──────────────────────────────────────────
export const uploadAttachment = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the author can add attachments.' });
    }
    if (report.status !== 'draft' && report.status !== 'revision_requested') {
      return res.status(400).json({ success: false, message: 'Can only add attachments to draft or revision-requested reports.' });
    }

    const newAttachments = await handleFileUploads(req.files);
    if (newAttachments.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided.' });
    }

    report.attachments = [...(report.attachments || []), ...newAttachments];
    addLifecycleEntry(report, 'note_added', req.user, `${newAttachments.length} attachment(s) added`);
    await report.save();

    res.json({ success: true, message: 'Attachments uploaded.', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportAnalytics = async (req, res) => {
  try {
    const acknowledged = await Report.find({ status: 'acknowledged' }).lean();

    const totalReports = acknowledged.length;
    const departmentStats = {};
    let totalEngagement = 0;
    let engagementCount = 0;

    acknowledged.forEach(r => {
      const dept = r.departmentName || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { count: 0, totalEngagement: 0, reports: [] };
      }
      departmentStats[dept].count += 1;
      departmentStats[dept].reports.push(r);

      r.metrics.forEach(m => {
        if (m.label?.toLowerCase().includes('engagement') && typeof m.value === 'number') {
          departmentStats[dept].totalEngagement += m.value;
          totalEngagement += m.value;
          engagementCount += 1;
        }
      });
    });

    const departments = Object.entries(departmentStats).map(([name, data]) => ({
      name,
      reportCount: data.count,
      avgEngagement: data.count > 0 && data.totalEngagement > 0
        ? Math.round(data.totalEngagement / data.reports.reduce((a, r) => {
            const engMetrics = r.metrics.filter(m => m.label?.toLowerCase().includes('engagement'));
            return a + engMetrics.length;
          }, 1)) : null,
    }));

    res.json({
      success: true,
      data: {
        totalAcknowledgedReports: totalReports,
        departments,
        averageEngagement: engagementCount > 0 ? Math.round(totalEngagement / engagementCount) : null,
        lastReportDate: acknowledged.length > 0 ? acknowledged[0].acknowledgedAt : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
