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
  }
};

export default dashboardService;