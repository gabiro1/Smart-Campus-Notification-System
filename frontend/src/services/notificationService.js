import apiClient from './apiClient';

const notificationService = {
  // Get notifications (with optional filters)
  getNotifications: async ({ page = 1, limit = 20, type, status, priority, search, isPinned } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (search) params.search = search;
    if (isPinned !== undefined) params.isPinned = isPinned;
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  // Get notification details
  getNotificationDetails: async (notificationId) => {
    const response = await apiClient.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark notification as read (FIXED: Uses notificationId, not eventId)
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read (FIXED: Matched URL to backend)
  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get AI summary
  getAISummary: async () => {
    const response = await apiClient.get('/notifications/summary');
    return response.data;
  },

  // Get AI digest summary
  generateDigest: async (period = 'weekly') => {
    try {
      const response = await apiClient.get('/notifications/digest', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Digest API error:', error);
      throw error;
    }
  },

  // Get latest cached digest (from cron or previous generation)
  getLatestDigest: async () => {
    const response = await apiClient.get('/notifications/digest/latest');
    return response.data;
  },

  // Get notification stats
  getStats: async (eventId) => {
    const response = await apiClient.get(`/notifications/stats/${eventId}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  // Get insights
  getInsights: async () => {
    const response = await apiClient.get('/notifications/insights');
    return response.data;
  },

  // Get unacknowledged emergency notifications
  getUnacknowledgedEmergencies: async () => {
    const response = await apiClient.get('/notifications/emergency/unacknowledged');
    return response.data;
  },

  // Acknowledge an emergency notification
  acknowledgeNotification: async (notificationId) => {
    const response = await apiClient.post(`/notifications/${notificationId}/acknowledge`);
    return response.data;
  },

  // Get acknowledgment statistics for a broadcast (admin/lecturer)
  getAcknowledgmentStats: async (referenceId) => {
    const response = await apiClient.get(`/notifications/stats/acknowledgment/${referenceId}`);
    return response.data;
  },

  // Toggle pin/unpin
  togglePin: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/pin`);
    return response.data;
  },

  // Toggle mute/unmute
  toggleMute: async (id) => {
    const response = await apiClient.put(`/notifications/${id}/mute`);
    return response.data;
  },
};

export default notificationService;