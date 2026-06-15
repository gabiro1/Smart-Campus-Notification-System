import apiClient from './apiClient';

const reminderService = {
  getReminders: async (params = {}) => {
    const response = await apiClient.get('/reminders', { params });
    return response.data;
  },

  getReminderById: async (id) => {
    const response = await apiClient.get(`/reminders/${id}`);
    return response.data;
  },

  createReminder: async (data) => {
    const response = await apiClient.post('/reminders', data);
    return response.data;
  },

  updateReminder: async (id, data) => {
    const response = await apiClient.put(`/reminders/${id}`, data);
    return response.data;
  },

  deleteReminder: async (id) => {
    const response = await apiClient.delete(`/reminders/${id}`);
    return response.data;
  },

  cancelReminder: async (id, reason) => {
    const response = await apiClient.post(`/reminders/${id}/cancel`, { reason });
    return response.data;
  },

  completeReminder: async (id) => {
    const response = await apiClient.post(`/reminders/${id}/complete`);
    return response.data;
  },

  uncompleteReminder: async (id) => {
    const response = await apiClient.post(`/reminders/${id}/uncomplete`);
    return response.data;
  },

  getDueReminders: async () => {
    const response = await apiClient.get('/reminders/due');
    return response.data;
  },

  getReminderTimeline: async () => {
    const response = await apiClient.get('/reminders/timeline');
    return response.data;
  },

  getReminderStats: async () => {
    const response = await apiClient.get('/reminders/stats');
    return response.data;
  },

  getReminderRecipients: async (id) => {
    const response = await apiClient.get(`/reminders/${id}/recipients`);
    return response.data;
  },

  getReminderPreferences: async () => {
    const response = await apiClient.get('/reminders/preferences');
    return response.data;
  },

  updateReminderPreferences: async (data) => {
    const response = await apiClient.put('/reminders/preferences', data);
    return response.data;
  },

  bulkCompleteReminders: async (ids) => {
    const response = await apiClient.post('/reminders/bulk/complete', { ids });
    return response.data;
  },

  bulkDeleteReminders: async (ids) => {
    const response = await apiClient.post('/reminders/bulk/delete', { ids });
    return response.data;
  },
};

export default reminderService;
