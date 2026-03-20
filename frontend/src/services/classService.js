import apiClient from './apiClient';

const classService = {
  // 1. Lecturer: Get only the classes assigned to the logged-in lecturer
  getMyClasses: async () => {
    try {
      const response = await apiClient.get('/classes/my-classes');
      return response.data; 
    } catch (error) {
      console.error("Failed to fetch lecturer classes:", error);
      throw error;
    }
  },

  // 2. Lecturer: Get the student roster for a specific class
  getClassStudents: async (classId) => {
    try {
      const response = await apiClient.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch class roster:", error);
      throw error;
    }
  },

  // 3. Admin/HOD: Get all classes (for future admin dashboard)
  getAllClasses: async () => {
    const response = await apiClient.get('/classes');
    return response.data;
  },

  // 4. Admin/HOD: Create a new class
  createClass: async (classData) => {
    const response = await apiClient.post('/classes', classData);
    return response.data;
  }
};

export default classService;