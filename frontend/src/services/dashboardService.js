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
      throw new Error("Could not log attendance.");
    }
  }
};

export default dashboardService;