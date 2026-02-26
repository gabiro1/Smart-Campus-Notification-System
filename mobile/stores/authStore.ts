import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'hod' | 'guild_president' | 'admin';
  phoneNumber: string;
  school: string;
  department: string;
  level: string;
  interests: string[];
  fcmToken?: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;

  // Actions
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  setFCMToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  token: null,

  bootstrap: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        set({ token });
        // Verify token is still valid
        const response = await apiClient.getProfile();
        set({
          user: response.data.user,
          isLoggedIn: true,
          token,
        });
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.login(email, password);
      const { token, user } = response.data;

      await SecureStore.setItemAsync('authToken', token);
      set({
        token,
        user,
        isLoggedIn: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.register(data);
      const { token, user } = response.data;

      await SecureStore.setItemAsync('authToken', token);
      set({
        token,
        user,
        isLoggedIn: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      set({
        user: null,
        isLoggedIn: false,
        token: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await apiClient.updateProfile(data);
      set({ user: response.data.user });
    } catch (error) {
      throw error;
    }
  },

  setFCMToken: async (fcmToken: string) => {
    try {
      const user = get().user;
      if (user && user.fcmToken !== fcmToken) {
        const response = await apiClient.updateFCMToken(fcmToken);
        set({ user: response.data.user });
      }
    } catch (error) {
      console.error('Error setting FCM token:', error);
    }
  },
}));
