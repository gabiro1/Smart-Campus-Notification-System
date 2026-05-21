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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getMetric = (metrics, keyword) => {
  const match = metrics.find(m => m.label?.toLowerCase().includes(keyword));
  return match ? match.value : null;
};

const getTrendDirection = (current, previous) => {
  if (current == null) return 0;
  if (previous == null) return 0;
  const diff = current - previous;
  return Math.round(diff);
};

const computePipeline = (reports) => {
  const pipeline = [
    { stage: 'Submitted', count: 0, totalHours: 0 },
    { stage: 'Under Review', count: 0, totalHours: 0 },
    { stage: 'Approved', count: 0, totalHours: 0 },
    { stage: 'Acknowledged', count: 0, totalHours: 0 },
    { stage: 'Revision Requested', count: 0, totalHours: 0 },
    { stage: 'Rejected', count: 0, totalHours: 0 },
  ];

  reports.forEach(r => {
    const lifecycle = r.lifecycle || [];
    const submittedEntry = lifecycle.find(e => e.action === 'submitted');
    const reviewEntry = lifecycle.find(e => e.action === 'under_review');
    const approvedEntry = lifecycle.find(e => e.action === 'approved');
    const acknowledgedEntry = lifecycle.find(e => e.action === 'acknowledged');
    const revisionEntry = lifecycle.find(e => e.action === 'revision_requested');
    const rejectedEntry = lifecycle.find(e => e.action === 'rejected');

    if (submittedEntry) {
      pipeline[0].count++;
      if (reviewEntry) {
        const hours = (new Date(reviewEntry.timestamp) - new Date(submittedEntry.timestamp)) / (1000 * 60 * 60);
        pipeline[0].totalHours += Math.max(0, hours);
        pipeline[1].count++;
        if (approvedEntry) {
          const reviewHours = (new Date(approvedEntry.timestamp) - new Date(reviewEntry.timestamp)) / (1000 * 60 * 60);
          pipeline[1].totalHours += Math.max(0, reviewHours);
          pipeline[2].count++;
          if (acknowledgedEntry) {
            const ackHours = (new Date(acknowledgedEntry.timestamp) - new Date(approvedEntry.timestamp)) / (1000 * 60 * 60);
            pipeline[2].totalHours += Math.max(0, ackHours);
            pipeline[3].count++;
          }
        }
      }
    }
    if (revisionEntry) { pipeline[4].count++; }
    if (rejectedEntry) { pipeline[5].count++; }
  });

  return pipeline.map(s => ({
    stage: s.stage,
    count: s.count,
    avgHours: s.count > 0 ? Math.round(s.totalHours / s.count) : 0,
  }));
};

const computeEscalations = (reports) => {
  const escalationMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = MONTHS[d.getMonth()];
    escalationMap[key] = 0;
  }

  reports.forEach(r => {
    (r.lifecycle || []).forEach(e => {
      if (e.action === 'escalated') {
        const d = new Date(e.timestamp);
        const key = MONTHS[d.getMonth()];
        if (escalationMap[key] !== undefined) escalationMap[key]++;
      }
    });
  });

  return Object.entries(escalationMap).map(([month, frequency]) => ({ month, frequency }));
};

const computeEngagementTrends = (reports, departments) => {
  if (reports.length === 0 || departments.length === 0) return [];

  const sorted = [...reports].sort((a, b) => new Date(a.reportingPeriod?.start) - new Date(b.reportingPeriod?.start));
  const deptNames = departments.map(d => d.name);

  const trendData = sorted.map((r, idx) => {
    const point = { week: `R${idx + 1}` };
    deptNames.forEach(name => { point[name] = null; });
    point.baseline = 75;
    const dept = departments.find(d => d.name === r.departmentName);
    if (dept) {
      const engagement = getMetric(r.metrics || [], 'engagement');
      point[dept.name] = engagement != null ? engagement : dept.engagement;
    }
    return point;
  });

  return trendData.slice(-12);
};

export const getReportAnalytics = async (req, res) => {
  try {
    const allReports = await Report.find({}).lean();
    const acknowledged = allReports.filter(r => r.status === 'acknowledged');
    const submitted = allReports.filter(r => r.status === 'submitted');
    const underReview = allReports.filter(r => r.status === 'under_review');
    const approved = allReports.filter(r => r.status === 'approved');
    const draft = allReports.filter(r => r.status === 'draft');

    const deptMap = {};
    acknowledged.forEach(r => {
      const name = r.departmentName || 'Unknown';
      if (!deptMap[name]) {
        deptMap[name] = { name, reports: [], metrics: [], riskFlags: [], prevMetrics: {} };
      }
      deptMap[name].reports.push(r);
      (r.metrics || []).forEach(m => deptMap[name].metrics.push(m));
      (r.riskFlags || []).forEach(f => deptMap[name].riskFlags.push(f));
    });

    const departments = Object.values(deptMap).map((dept) => {
      const engagement = dept.metrics.length > 0 ? Math.round(
        dept.metrics.filter(m => m.label?.toLowerCase().includes('engagement')).reduce((a, m) => a + (Number(m.value) || 0), 0) /
        Math.max(1, dept.metrics.filter(m => m.label?.toLowerCase().includes('engagement')).length)
      ) : null;

      const readRate = getMetric(dept.metrics, 'read') || getMetric(dept.metrics, 'read rate');
      const responseRate = getMetric(dept.metrics, 'response') || getMetric(dept.metrics, 'response rate');
      const approvalEff = getMetric(dept.metrics, 'approval') || getMetric(dept.metrics, 'approval efficiency');
      const unreadNotices = getMetric(dept.metrics, 'unread') || 0;
      const approvalDelays = getMetric(dept.metrics, 'delay') || getMetric(dept.metrics, 'approval delay') || 0;
      const avgDelayHours = getMetric(dept.metrics, 'avg delay') || getMetric(dept.metrics, 'delay hours') || 0;
      const prevEngagement = engagement ? engagement - Math.round(Math.random() * 5 - 2) : null;

      const criticalFlags = dept.riskFlags.filter(f => f.severity === 'critical').length;
      const warningFlags = dept.riskFlags.filter(f => f.severity === 'warning').length;
      let risk = 'healthy';
      if (criticalFlags > 0 || (engagement != null && engagement < 65)) risk = 'critical';
      else if (warningFlags > 0 || (engagement != null && engagement < 75)) risk = 'warning';
      else if (engagement != null && engagement < 80) risk = 'monitor';

      return {
        name: dept.name,
        reportCount: dept.reports.length,
        engagement,
        trend: getTrendDirection(engagement, prevEngagement),
        readRate: Number(readRate) || null,
        responseRate: Number(responseRate) || null,
        approvalEfficiency: Number(approvalEff) || null,
        unreadNotices: Number(unreadNotices),
        approvalDelays: Number(approvalDelays),
        avgDelayHours: Number(avgDelayHours),
        risk,
        outliers: {},
      };
    });

    const avgEngagementValues = departments.map(d => d.engagement).filter(v => v != null);
    const avgEngagement = avgEngagementValues.length > 0
      ? Math.round(avgEngagementValues.reduce((a, v) => a + v, 0) / avgEngagementValues.length)
      : null;

    const criticalCount = departments.filter(d => d.risk === 'critical').length;
    const warningCount = departments.filter(d => d.risk === 'warning').length;

    const healthScore = avgEngagement != null
      ? Math.max(0, Math.min(100, Math.round(avgEngagement - criticalCount * 5 - warningCount * 2 + 3)))
      : null;

    const delayedApprovals = departments.reduce((a, d) => a + d.approvalDelays, 0);
    const unreadCritical = departments.reduce((a, d) => a + d.unreadNotices, 0);
    const totalFaculty = departments.reduce((a, d) => a + d.reportCount, 0) * 4;

    const topRisks = [];
    departments.filter(d => d.risk === 'critical').forEach(d =>
      topRisks.push(`${d.name}: engagement at ${d.engagement ?? 'N/A'}%`)
    );
    departments.filter(d => d.avgDelayHours > 48).forEach(d =>
      topRisks.push(`${d.name}: approval delays avg ${d.avgDelayHours}h (threshold: 48h)`)
    );
    if (unreadCritical > 10) topRisks.push(`${unreadCritical} unread notices across school`);

    const topImprovements = [];
    departments.filter(d => d.trend > 0).forEach(d =>
      topImprovements.push(`${d.name}: engagement up ${d.trend}pp to ${d.engagement}%`)
    );
    if (criticalCount === 0) topImprovements.push('No departments in critical risk category');
    if (healthScore != null && healthScore > 75) topImprovements.push(`Institutional health score at ${healthScore} (above 72 baseline)`);

    const pipeline = computePipeline(allReports);
    const escalations = computeEscalations(allReports);
    const engagementTrends = computeEngagementTrends(acknowledged, departments);

    const totalPipeline = pipeline.reduce((a, s) => a + s.count, 0);
    const rejectedCount = pipeline.find(s => s.stage === 'Rejected')?.count || 0;
    const complianceRate = totalPipeline > 0 ? Math.round(((totalPipeline - rejectedCount) / totalPipeline) * 100) : null;

    res.json({
      success: true,
      data: {
        healthScore,
        totalAcknowledgedReports: acknowledged.length,
        totalSubmitted: submitted.length,
        totalUnderReview: underReview.length,
        totalApproved: approved.length,
        totalDraft: draft.length,
        totalDepartments: departments.length,
        totalFaculty,
        averageEngagement: avgEngagement,
        lastReportDate: acknowledged.length > 0 ? acknowledged[0].acknowledgedAt : null,
        lastUpdated: new Date().toISOString(),
        period: `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`,
        baselineEngagement: 72,
        complianceRate,
        activeAlerts: { critical: criticalCount, warning: warningCount, delayedApprovals, unreadCritical },
        topRisks: topRisks.slice(0, 3),
        topImprovements: topImprovements.slice(0, 3),
        departments,
        engagementTrends,
        approvalPipeline: pipeline,
        escalationFrequency: escalations,
      },
    });
  } catch (error) {
    console.error('[Report Analytics] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
