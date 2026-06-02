import apiClient from './apiClient';


const adminService = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/admin/metrics');
    return response.data;
  },

  // Create / register new user
createUser: async (userData) => {
  const response = await apiClient.post('/admin/users', userData);
  return response.data;
},

  // Get users (supports getAll=true for fetching all without pagination)
  getUsers: async (page = 1, limit = 20, filters = {}, getAll = false) => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit, ...filters, getAll: getAll ? 'true' : 'false' },
    });
    return response.data;
  },

  // Get single user
  getUser: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Promote user role
  promoteUser: async (userId, newRole) => {
    const response = await apiClient.post(`/admin/users/${userId}/promote`, {
      role: newRole,
    });
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (userId, password) => {
    const response = await apiClient.post(`/admin/users/${userId}/reset-password`, { password });
    return response.data;
  },

  // Get analytics
  getAnalytics: async (startDate, endDate) => {
    const response = await apiClient.get('/admin/analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get audit logs
  getAuditLogs: async (page = 1, limit = 20, filters = {}) => {
    const response = await apiClient.get('/admin/audit-logs', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get broadcast history
  getBroadcastHistory: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/admin/broadcasts', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get event monitor
  getEventMonitor: async () => {
    const response = await apiClient.get('/admin/event-monitor');
    return response.data;
  },

  // Get department stats
  getDepartmentStats: async () => {
    const response = await apiClient.get('/admin/departments-stats');
    return response.data;
  },

  // Get AI-powered insights and recommendations
  getAIInsights: async () => {
    const response = await apiClient.get('/admin/ai-insights');
    return response.data;
  },

  // Get engagement by department
  getEngagementByDepartment: async () => {
    const response = await apiClient.get('/admin/engagement');
    return response.data;
  },

  // Send SMS
  sendSMS: async (phoneNumbers, message) => {
    const response = await apiClient.post('/admin/sms', {
      phoneNumbers,
      message,
    });
    return response.data;
  },

  // Test SMS (for debugging) - uses mock mode
  testSMS: async (phoneNumber) => {
    const response = await apiClient.post('/messages/mock', {
      phoneNumber,
    });
    return response.data;
  },

  // Get settings
  getSettings: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data || response.data || {};
  },

  // Get SMS quota
  getSMSQuota: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data?.smsQuota || { used: 0, limit: 10000 };
  },

  // Update system settings
  updateSettings: async (settings) => {
    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  },

  // Upload flyer for AI OCR parsing
  parseFlyer: async (file) => {
    const formData = new FormData();
    formData.append('flyer', file); // Backend expects 'flyer'
    const response = await apiClient.post('/events/parse-flyer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Create a new event/broadcast
  createEvent: async (eventData) => {
    const response = await apiClient.post('/events/create', eventData); 
    return response.data;
  },
  // Fetch system logs
  getSystemLogs: async (filter = 'all') => {
    const response = await apiClient.get('/admin/logs', { params: { filter } });
    return response.data;
  },

  // Run system diagnostics
  runSystemTests: async () => {
    const response = await apiClient.post('/admin/tests/run');
    return response.data;
  },

  // Get list of previous backups
  getBackups: async () => {
    const response = await apiClient.get('/admin/backups');
    return response.data.backups || [];
  },

  // Trigger a new backup
  createBackup: async (type) => {
    const response = await apiClient.post('/admin/backups', { type });
    return response.data;
  },

  // Restore a previous backup
  restoreBackup: async (backupId) => {
    const response = await apiClient.post(`/admin/backups/${backupId}/restore`);
    return response.data;
  },

  // Get dynamic academic structure
  getHierarchy: async () => {
    const response = await apiClient.get('/admin/hierarchy');
    return response.data;
  },

  // System health & diagnostics
  getSystemHealth: async () => {
    const response = await apiClient.get('/admin/health');
    return response.data;
  },

  runDiagnostics: async () => {
    const response = await apiClient.post('/admin/diagnostics');
    return response.data;
  },

  // Fetch all events with pagination and filters
  getEvents: async (page = 1, limit = 10, filters = {}) => {
    const response = await apiClient.get('/events', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  // Fetch all events with pagination and filters
  getAllEvents: async (page = 1, limit = 10, filters = {}) => {
    const response = await apiClient.get('/events', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
  },
  updateEvent: async (eventId, data) => {
    const response = await apiClient.put(`/events/${eventId}`, data);
    return response.data;
  },

  // Get active emergency broadcasts with acknowledgment statistics
  getActiveEmergencies: async () => {
    const response = await apiClient.get('/admin/announcements/active-emergencies');
    return response.data;
  },

  // ==========================================
  // ACADEMIC STRUCTURE CRUD
  // ==========================================

  // Colleges
  getColleges: async () => {
    const response = await apiClient.get('/colleges');
    return response.data;
  },
  createCollege: async (data) => {
    const response = await apiClient.post('/colleges', data);
    return response.data;
  },
  updateCollege: async (id, data) => {
    const response = await apiClient.put(`/colleges/${id}`, data);
    return response.data;
  },
  deleteCollege: async (id) => {
    const response = await apiClient.delete(`/colleges/${id}`);
    return response.data;
  },

  // Schools
  getSchools: async () => {
    const response = await apiClient.get('/schools');
    return response.data;
  },
  createSchool: async (data) => {
    const response = await apiClient.post('/schools', data);
    return response.data;
  },
  updateSchool: async (id, data) => {
    const response = await apiClient.put(`/schools/${id}`, data);
    return response.data;
  },
  deleteSchool: async (id) => {
    const response = await apiClient.delete(`/schools/${id}`);
    return response.data;
  },

  // Departments
  getDepartments: async () => {
    const response = await apiClient.get('/departments');
    return response.data;
  },
  createDepartment: async (data) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },
  updateDepartment: async (id, data) => {
    const response = await apiClient.put(`/departments/${id}`, data);
    return response.data;
  },
  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },

  // Classes
  getClasses: async () => {
    const response = await apiClient.get('/classes', { params: { includeStudents: 'true' } });
    return response.data;
  },
  createClass: async (data) => {
    const response = await apiClient.post('/classes', data);
    return response.data;
  },
  updateClass: async (id, data) => {
    const response = await apiClient.put(`/classes/${id}`, data);
    return response.data;
  },
  deleteClass: async (id) => {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  },

  // Assign student to class
  assignStudentToClass: async (classId, studentId) => {
    const response = await apiClient.post(`/classes/${classId}/assign-student`, { studentId });
    return response.data;
  },

  // Remove student from class
  removeStudentFromClass: async (classId, studentId) => {
    const response = await apiClient.delete(`/classes/${classId}/remove-student/${studentId}`);
    return response.data;
  },

  // Courses
  getCourses: async () => {
    const response = await apiClient.get('/courses');
    return response.data;
  },
  createCourse: async (data) => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },
  updateCourse: async (id, data) => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },
  deleteCourse: async (id) => {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data;
  },
  // ==========================================
  // TIMETABLE MANAGEMENT
  // ==========================================

  getTimetable: async (filters = {}) => {
    const response = await apiClient.get('/timetable', { params: filters });
    return response.data;
  },

  getTimetableByClass: async (classId) => {
    const response = await apiClient.get(`/timetable/class/${classId}`);
    return response.data;
  },

  createTimetableEntry: async (data) => {
    const response = await apiClient.post('/timetable', data);
    return response.data;
  },

  updateTimetableEntry: async (id, data) => {
    const response = await apiClient.put(`/timetable/${id}`, data);
    return response.data;
  },

  deleteTimetableEntry: async (id) => {
    const response = await apiClient.delete(`/timetable/${id}`);
    return response.data;
  },

  // ==========================================
  // HR ACCOUNTS CRUD
  // ==========================================

  getHRAccounts: async (page = 1, limit = 20, search = '') => {
    const response = await apiClient.get('/admin/hr-accounts', { params: { page, limit, search } });
    return response.data;
  },

  getHRAccount: async (id) => {
    const response = await apiClient.get(`/admin/hr-accounts/${id}`);
    return response.data;
  },

  createHRAccount: async (data) => {
    const response = await apiClient.post('/admin/hr-accounts', data);
    return response.data;
  },

  updateHRAccount: async (id, data) => {
    const response = await apiClient.put(`/admin/hr-accounts/${id}`, data);
    return response.data;
  },

  deleteHRAccount: async (id) => {
    const response = await apiClient.delete(`/admin/hr-accounts/${id}`);
    return response.data;
  },

  // ==========================================
  // ROLE MANAGEMENT
  // ==========================================

  getRoles: async (page = 1, limit = 50, getAll = false) => {
    const response = await apiClient.get('/roles', {
      params: { page, limit, getAll: getAll ? 'true' : 'false' },
    });
    return response.data;
  },

  getRole: async (id) => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  createRole: async (data) => {
    const response = await apiClient.post('/roles', data);
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },
};

export default adminService;
