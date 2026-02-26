import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error reading token:', error);
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear auth
          await SecureStore.deleteItemAsync('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    school: string;
    department: string;
    level: string;
    interests: string[];
  }) {
    return this.client.post('/users/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('/users/login', { email, password });
  }

  async getProfile() {
    return this.client.get('/users/profile');
  }

  async updateProfile(data: any) {
    return this.client.put('/users/profile', data);
  }

  // Event endpoints
  async getEventFeed(page = 1, limit = 10) {
    return this.client.get('/events/feed', {
      params: { page, limit },
    });
  }

  async getEventDetail(eventId: string) {
    return this.client.get(`/events/${eventId}`);
  }

  async createEvent(data: any) {
    return this.client.post('/events/create', data);
  }

  async updateEvent(eventId: string, data: any) {
    return this.client.put(`/events/${eventId}`, data);
  }

  async deleteEvent(eventId: string) {
    return this.client.delete(`/events/${eventId}`);
  }

  async addEventInterest(eventId: string) {
    return this.client.post(`/events/${eventId}/interest`);
  }

  async rateEvent(eventId: string, rating: number) {
    return this.client.post(`/events/${eventId}/rate`, { rating });
  }

  // Notification endpoints
  async markNotificationAsRead(eventId: string) {
    return this.client.put(`/notifications/read/${eventId}`);
  }

  async getEventStats(eventId: string) {
    return this.client.get(`/notifications/stats/${eventId}`);
  }

  async getAIInsights() {
    return this.client.get('/notifications/insights');
  }

  // Update FCM token
  async updateFCMToken(fcmToken: string) {
    return this.client.put('/users/profile', { fcmToken });
  }
}

export const apiClient = new APIClient();
