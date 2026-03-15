import apiClient from './apiClient';

const announcementService = {
  // Lecturer: Create Announcement (Handles text + files)
  createAnnouncement: async (formData) => {
    const response = await apiClient.post('/announcements/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Lecturer: Get assigned classes for the dropdown
  getMyClasses: async () => {
    // UPDATED: Pointing to the correct route in the classes module
    const response = await apiClient.get('/classes'); 
    return response.data;
  },

  // Shared: Get Announcements for a specific class
  getClassAnnouncements: async (classId) => {
    const response = await apiClient.get(`/announcements/class/${classId}`);
    return response.data;
  },

  // Shared: Add Q&A Reply
  addComment: async (announcementId, content) => {
    const response = await apiClient.post(`/announcements/${announcementId}/comment`, {
      content,
    });
    return response.data;
  },

  // Student: Tracker
  markAsViewed: async (announcementId) => {
    const response = await apiClient.post(`/announcements/${announcementId}/view`);
    return response.data;
  }
};

export default announcementService;