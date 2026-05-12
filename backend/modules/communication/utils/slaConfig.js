export const SLA_CONFIG = {
  critical: { hours: 4, reminderAt: 0.5, escalateAt: 0.75 },
  high:     { hours: 8, reminderAt: 0.5, escalateAt: 0.75 },
  normal:   { hours: 48, reminderAt: 0.6, escalateAt: 0.85 },
  low:      { hours: 120, reminderAt: 0.7, escalateAt: 0.9 }
};

export const ESCALATION_CHAINS = {
  missing_marks: {
    levels: [
      { level: 1, role: 'lecturer',        timeoutHours: 72 },
      { level: 2, role: 'hod',             timeoutHours: 48 },
      { level: 3, role: 'dean',            timeoutHours: 24 },
      { level: 4, role: 'principal',       timeoutHours: 0 }
    ]
  },
  hostel_issue: {
    levels: [
      { level: 1, role: 'accommodation_office', timeoutHours: 24 },
      { level: 2, role: 'student_affairs',       timeoutHours: 48 },
      { level: 3, role: 'dean',                  timeoutHours: 24 },
      { level: 4, role: 'principal',             timeoutHours: 0 }
    ]
  },
  ticket_general: {
    levels: [
      { level: 1, role: 'office_agent',   timeoutHours: 48 },
      { level: 2, role: 'office_manager', timeoutHours: 24 },
      { level: 3, role: 'hod',            timeoutHours: 24 },
      { level: 4, role: 'dean',           timeoutHours: 0 }
    ]
  },
  technical_support: {
    levels: [
      { level: 1, role: 'office_agent',   timeoutHours: 24 },
      { level: 2, role: 'office_manager', timeoutHours: 12 },
      { level: 3, role: 'hod',            timeoutHours: 24 },
      { level: 4, role: 'dean',           timeoutHours: 0 }
    ]
  }
};

export const computeSlaDeadline = (priority) => {
  const config = SLA_CONFIG[priority] || SLA_CONFIG.normal;
  return new Date(Date.now() + config.hours * 3600000);
};
