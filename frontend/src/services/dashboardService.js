import apiClient from './apiClient';

const dashboardService = {
  /**
   * @desc Fetches the complete student overview: Stats, Schedule, and Recent Contacts.
   * @returns {Object} { stats: {}, schedule: [], recentMessages: [] }
   */
  getStudentSummary: async () => {
  try {
    const response = await apiClient.get('/student/dashboard'); 
    return response.data;
  } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
},

  /**
   * @desc Logs a student's presence at an event (QR scan or Acknowledge)
   */
  logAttendance: async (eventId) => {
    try {
      const response = await apiClient.post(`/users/attendance/${eventId}`);
      return response.data;
    } catch (error) {
      console.error("Could not log attendance.", error);
      throw error;
    }
  },
  getNoticeBoard: async () => {
    try {
      // Make sure this matches the route you created in your backend!
      const response = await apiClient.get('/announcements/my-feed'); 
      return response.data; // This should return { success: true, data: [...] }
    } catch (error) {
      console.error("Failed to fetch notice board:", error);
      throw error;
    }
  }, 

  //  NEW: Silent Auto-Read Receipt
  markAsViewed: async (announcementId) => {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/view`);
      return response.data;
    } catch (error) {
      console.error(`Failed to register view for ${announcementId}:`, error);
      throw error;
    }
  },

  // NEW: Post a Comment / Reply
  addComment: async (announcementId, content) => {
    try {
      // Notice we are passing { content } exactly as your backend expects in req.body
      const response = await apiClient.post(`/announcements/${announcementId}/comment`, { content });
      return response.data;
    } catch (error) {
      console.error(`Failed to post comment on ${announcementId}:`, error);
      throw error;
    }
  },

  // NEW: Delete a Comment
  deleteComment: async (announcementId, commentId) => {
    try {
      const response = await apiClient.delete(`/announcements/${announcementId}/comment/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error;
    }
  },

  // NEW: Update an existing comment
  updateComment: async (announcementId, commentId, content) => {
    try {
      const response = await apiClient.patch(
        `/announcements/${announcementId}/comment/${commentId}`, 
        { content }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update comment ${commentId}:`, error);
      throw error;
    }
  },
};

export default dashboardService;