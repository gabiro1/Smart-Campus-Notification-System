import apiClient from './apiClient';

const reminderService = {
  // Get all reminders for user
  getReminders: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/reminders', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get reminder details
  getReminderDetails: async (reminderId) => {
    const response = await apiClient.get(`/reminders/${reminderId}`);
    return response.data;
  },

  // Create reminder
  createReminder: async (reminderData) => {
    const response = await apiClient.post('/reminders', reminderData);
    return response.data;
  },

  // Update reminder
  updateReminder: async (reminderId, reminderData) => {
    const response = await apiClient.put(`/reminders/${reminderId}`, reminderData);
    return response.data;
  },

  // Delete reminder
  deleteReminder: async (reminderId) => {
    const response = await apiClient.delete(`/reminders/${reminderId}`);
    return response.data;
  },

  // Mark reminder as completed
  completeReminder: async (reminderId) => {
    const response = await apiClient.post(`/reminders/${reminderId}/complete`);
    return response.data;
  },

  // Mark reminder as incomplete
  uncompleteReminder: async (reminderId) => {
    const response = await apiClient.post(`/reminders/${reminderId}/uncomplete`);
    return response.data;
  },

  // Get due reminders
  getDueReminders: async () => {
    const response = await apiClient.get('/reminders/due');
    return response.data;
  },
};

export default reminderService;
