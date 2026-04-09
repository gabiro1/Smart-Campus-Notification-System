import apiClient from './apiClient';

const supportService = {
  // Submit a new support ticket
  submitTicket: async (ticketData) => {
    const response = await apiClient.post('/support', ticketData);
    return response.data;
  },

  // Get my tickets
  getMyTickets: async (params = {}) => {
    const response = await apiClient.get('/support/my', { params });
    return response.data;
  },

  // Get single ticket
  getTicket: async (ticketId) => {
    const response = await apiClient.get(`/support/${ticketId}`);
    return response.data;
  },

  // Get all tickets (admin/lecturer/hod/dean)
  getAllTickets: async (params = {}) => {
    const response = await apiClient.get('/support/all', { params });
    return response.data;
  },

  // Reply to ticket (admin/lecturer/hod/dean)
  replyToTicket: async (ticketId, data) => {
    const response = await apiClient.put(`/support/${ticketId}/reply`, data);
    return response.data;
  },

  // Delete ticket (admin only)
  deleteTicket: async (ticketId) => {
    const response = await apiClient.delete(`/support/${ticketId}`);
    return response.data;
  },
};

export default supportService;
