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
   * @desc Fetches the student's timetable based on their class assignment.
   * @param {string} dayOfWeek - Optional day filter (e.g., 'Monday')
   */
  getStudentTimetable: async (dayOfWeek) => {
    try {
      const params = dayOfWeek ? { dayOfWeek } : {};
      const response = await apiClient.get('/student/timetable', { params });
      return response.data;
    } catch (error) {
      console.error("Timetable Service Error:", error);
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

  // ======= HOD DASHBOARD INTELLIGENCE API =======

  getHodSummary: async () => {
    const response = await apiClient.get('/hod/dashboard/summary');
    return response.data;
  },

  getHodAlerts: async () => {
    const response = await apiClient.get('/hod/dashboard/alerts');
    return response.data;
  },

  getHodActivityFeed: async (limit = 20) => {
    const response = await apiClient.get('/hod/dashboard/activity', { params: { limit } });
    return response.data;
  },

  getHodAnalytics: async ({ metric = 'announcements', range = '7d', comparison = false } = {}) => {
    const response = await apiClient.get('/hod/dashboard/analytics', {
      params: { metric, range, comparison }
    });
    return response.data;
  },

  getHodKpis: async () => {
    const response = await apiClient.get('/hod/dashboard/kpis');
    return response.data;
  },

  batchApproveAnnouncements: async (ids) => {
    const response = await apiClient.post('/hod/announcements/batch-approve', { ids });
    return response.data;
  },

  getInactiveLecturers: async (days = 7) => {
    const response = await apiClient.get('/hod/lecturers/inactive', { params: { days } });
    return response.data;
  },

  getAtRiskStudents: async () => {
    const response = await apiClient.get('/hod/students/at-risk');
    return response.data;
  },
};

export default dashboardService;