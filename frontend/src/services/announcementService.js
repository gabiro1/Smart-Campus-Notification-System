import apiClient from './apiClient';

const announcementService = {
  // 1. Lecturer: Create Announcement 
  createAnnouncement: async (formData) => {
    const response = await apiClient.post('/announcements/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data;
  },

  // 8. Lecturer: Get ONLY my announcements for the management table
  getLecturerAnnouncements: async () => {
    try {
      const response = await apiClient.get('/announcements/lecturer-manage');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch lecturer announcements:", error);
      throw error;
    }
  },

  // 2. Lecturer: Delete Announcement (The "Oops" Button)
  deleteAnnouncement: async (announcementId) => {
    const response = await apiClient.delete(`/announcements/${announcementId}`);
    return response.data;
  },

  // 3. Lecturer: Get assigned courses for the dropdown
  getMyCourses: async () => {
    const response = await apiClient.get('/courses/my-courses'); 
    return response.data;
  },

  // 4. Shared: Get Announcements for a specific class (Now with Pagination ready!)
  // Example usage: getClassAnnouncements(classId, 1, 10)
  getClassAnnouncements: async (classId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/announcements/class/${classId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 5. Shared: Add Q&A Reply
  addComment: async (announcementId, content) => {
    const response = await apiClient.post(`/announcements/${announcementId}/comment`, {
      content,
    });
    return response.data;
  },

  // 6. Lecturer: Delete a specific comment
  deleteComment: async (announcementId, commentId) => {
    const response = await apiClient.delete(`/announcements/${announcementId}/comment/${commentId}`);
    return response.data;
  },

  // 7. Student: Silent Tracker
  markAsViewed: async (announcementId) => {
    const response = await apiClient.post(`/announcements/${announcementId}/view`);
    return response.data;
  }, 

  getAllAnnouncements: async () => {
    try {
      const response = await apiClient.get('/announcements/my-feed');
      return response.data.data; // Returning the array directly
    } catch (error) {
      console.error("Failed to fetch all announcements:", error);
      throw error;
    }
  }, 
  // 9. NEW: Update a specific comment (THE MISSING PIECE)
  updateComment: async (announcementId, commentId, content) => {
    try {
      const response = await apiClient.patch(`/announcements/${announcementId}/comment/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error("Update Service Error:", error);
      throw error;
    }
  }, 
  // 10. NEW: Update a specific Announcement/Broadcast
updateAnnouncement: async (announcementId, updateData) => {
  try {
    const response = await apiClient.patch(`/announcements/${announcementId}`, updateData);
    return response.data; // This returns { success: true, data: updatedDoc }
  } catch (error) {
    console.error("Update Broadcast Service Error:", error);
    throw error;
  }
  }, 

  getDashboardStats: async () => {
    const response = await apiClient.get('/announcements/dashboard-stats');
    return response.data;
  },

  // 11. SCHEDULING: Get scheduled announcements
  getScheduledAnnouncements: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/announcements/scheduled', {
      params: { page, limit }
    });
    return response.data;
  },

  // 12. SCHEDULING: Cancel scheduled announcement
  cancelScheduledAnnouncement: async (announcementId) => {
    const response = await apiClient.delete(`/announcements/scheduled/${announcementId}/cancel`);
    return response.data;
  },

  // 13. SCHEDULING: Reschedule announcement
  rescheduleAnnouncement: async (announcementId, scheduledAt) => {
    const response = await apiClient.patch(`/announcements/scheduled/${announcementId}/reschedule`, {
      scheduledAt
    });
    return response.data;
  },

  // 14. AI: Generate professional announcement from raw draft
  suggestAnnouncement: async (rawText) => {
    const response = await apiClient.post('/ai/suggest-announcement', {
      rawText,
    });
    return response.data;
  },

  // 15. Analytics: Get read receipt stats for an announcement
  getAnnouncementAnalytics: async (announcementId) => {
    const response = await apiClient.get(`/analytics/announcements/${announcementId}`);
    return response.data;
  },
};

export default announcementService;