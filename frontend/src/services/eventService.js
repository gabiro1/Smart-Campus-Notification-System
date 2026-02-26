import apiClient from './apiClient';

const eventService = {
  // Get all events with pagination
  getEvents: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/events/feed', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get single event details
  getEventDetails: async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },

  // Search events
  searchEvents: async (query) => {
    const response = await apiClient.get('/events/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get events by department
  getEventsByDepartment: async (department, page = 1) => {
    const response = await apiClient.get('/events/department', {
      params: { department, page, limit: 10 },
    });
    return response.data;
  },

  // Create event
  createEvent: async (eventData) => {
    const response = await apiClient.post('/events/create', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
  },

  // Mark event as interested
  markInterested: async (eventId) => {
    const response = await apiClient.post(`/events/${eventId}/interest`);
    return response.data;
  },

  // Rate event
  rateEvent: async (eventId, rating) => {
    const response = await apiClient.post(`/events/${eventId}/rate`, {
      rating,
    });
    return response.data;
  },

  // Get event statistics
  getEventStats: async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/stats`);
    return response.data;
  },

  // Get departments
  getDepartments: async () => {
    const response = await apiClient.get('/events/departments');
    return response.data;
  },
};

export default eventService;
