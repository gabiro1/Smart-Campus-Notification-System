import apiClient from './apiClient';

const authService = {
  // 1. Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      return response.data; // Returns { success, token, user }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  },

  // 2. Register
  register: async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed.');
    }
  },

  // 3. Google Auth
  googleAuth: async (credential) => {
    try {
      const response = await apiClient.post('/users/auth/google', { credential });
      return response.data; // Returns { success, token, user }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google authentication failed.');
    }
  },

  // 4. Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile.');
    }
  },

  // 5. Update profile (e.g. changing AI interests)
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
  },

  // 6. Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/users/notification-preferences', { preferences });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences.');
    }
  }
};

export default authService;