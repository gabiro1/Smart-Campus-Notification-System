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

  // 3. Google Auth (Firebase)
  firebaseGoogleAuth: async (idToken) => {
    try {
      const response = await apiClient.post('/users/auth/google', { credential: idToken });
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
  },

  // 7. Change password (first login or voluntary)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/users/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password.');
    }
  },

  // 8. Unlock account (admin/registrar)
  unlockAccount: async (userId) => {
    try {
      const response = await apiClient.put(`/users/unlock/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unlock account.');
    }
  }
};

export default authService;