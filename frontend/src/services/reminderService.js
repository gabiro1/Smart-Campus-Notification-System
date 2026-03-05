import apiClient from './apiClient';

const reminderService = {
  // Get all reminders for the logged-in user
  getReminders: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/reminders', {
      params: { page, limit },
    });
    return response.data; // Expected: { reminders: [], pagination: {} }
  },

  // Create a new reminder
  createReminder: async (reminderData) => {
    // reminderData should contain: title, note, dueDate, priority, category
    const response = await apiClient.post('/reminders', reminderData);
    return response.data;
  },

  // Update a reminder (used for Drag & Drop or editing)
  updateReminder: async (reminderId, reminderData) => {
    const response = await apiClient.put(`/reminders/${reminderId}`, reminderData);
    return response.data;
  },

  // Delete a reminder
  deleteReminder: async (reminderId) => {
    const response = await apiClient.delete(`/reminders/${reminderId}`);
    return response.data;
  },

  // Mark as completed
  completeReminder: async (reminderId) => {
    const response = await apiClient.post(`/reminders/${reminderId}/complete`);
    return response.data;
  },

  // Mark as incomplete
  uncompleteReminder: async (reminderId) => {
    const response = await apiClient.post(`/reminders/${reminderId}/uncomplete`);
    return response.data;
  }
};

export default reminderService;