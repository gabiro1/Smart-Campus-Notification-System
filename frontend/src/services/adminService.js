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

  // Get users
  getUsers: async (page = 1, limit = 20, filters = {}) => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit, ...filters },
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

  // Get analytics
  getAnalytics: async (startDate, endDate) => {
    const response = await apiClient.get('/admin/analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get audit logs
  getAuditLogs: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/admin/audit-logs', {
      params: { page, limit },
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

  // Get SMS quota
  getSMSQuota: async () => {
    const response = await apiClient.get('/admin/sms-quota');
    return response.data;
  },
};

export default adminService;
