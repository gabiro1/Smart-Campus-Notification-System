import apiClient from './apiClient';

const eventService = {
  // --- READ METHODS ---

  // Aligned with Dashboard: Get AI-ranked feed
  getFeed: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/events/feed', {
        params: { page, limit },
      });
      // We return exactly what the UI needs: the array of events
      return response.data.events || response.data;
    } catch (error) {
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

  // --- ACTION METHODS ---

  // Bookmark an event
  toggleInterest: async (eventId) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/interest`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to save event.");
    }
  },

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
  }
};

export default eventService;