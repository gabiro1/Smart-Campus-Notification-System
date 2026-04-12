import apiClient from './apiClient';

const eventService = {
  // --- READ METHODS ---

  // Aligned with Dashboard: Get AI-ranked feed
  getFeed: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/events/feed', {
        params: { page, limit },
      });
      
      // Handle both formats: { success, events, total } or direct array
      let events = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          events = response.data;
        } else if (response.data.events) {
          events = response.data.events;
        } else if (response.data.data) {
          events = response.data.data;
        }
      }
      
      console.log('[eventService] Fetched events:', events.length);
      return events;
    } catch (error) {
      console.error("Feed error:", error);
      throw new Error(error.response?.data?.message || "Couldn't load your feed.");
    }
  },

  // Search through campus events
  searchEvents: async (query) => {
    try {
      const response = await apiClient.get('/events/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw new Error("Search failed.");
    }
  },

  // --- BOOKMARK METHODS ---
  
  getBookmarks: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/events/bookmarks', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch bookmarks.");
    }
  },

  toggleBookmark: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/bookmark`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to toggle bookmark.");
    }
  },

  // --- ACTION METHODS ---

  // Express Interest (Machine Learning AI Weight Adjustment)

  // Submit AI Training Data (Rating)
  rateEvent: async (eventId, rating) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw new Error("Failed to submit rating.");
    }
  },

  // --- STAFF/ADMIN METHODS ---

  // The AI "Magic" feature: Extracting data from an image
  parseFlyer: async (file) => {
    try {
      const formData = new FormData();
      formData.append('flyer', file);
      
      const response = await apiClient.post('/events/parse-flyer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data; // Should return { title, date, location, etc }
    } catch (error) {
      throw new Error("AI failed to read the flyer. Please enter details manually.");
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await apiClient.post('/events/create', eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create event.");
    }
  },

  // Get event statistics including RSVP and attendance counts
  getStats: async (eventId, includeAttendees = false) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/stats?attended=${includeAttendees}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch event stats.");
    }
  },

  // Scan attendance via QR (for lecturers/admins)
  scanAttendance: async (eventId, studentId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/scan-attendance`, { studentId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to record attendance.");
    }
  }
};

export default eventService;