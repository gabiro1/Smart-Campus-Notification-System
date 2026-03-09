import apiClient from './apiClient';

const notificationService = {
  // Get notifications
  getNotifications: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get notification details
  getNotificationDetails: async (notificationId) => {
    const response = await apiClient.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (eventId) => {
    const response = await apiClient.put(`/notifications/read/${eventId}`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
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
};

export default notificationService;
