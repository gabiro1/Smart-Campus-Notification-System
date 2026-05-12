import api from '../apiClient';

const communicationService = {
  getContacts: async () => {
    const { data } = await api.get('/communication/contacts');
    return data;
  },

  getOffices: async () => {
    const { data } = await api.get('/communication/contacts/offices');
    return data;
  },

  checkRelationship: async (userId) => {
    const { data } = await api.get(`/communication/contacts/${userId}/relationship`);
    return data;
  },

  getConversations: async (params = {}) => {
    const { data } = await api.get('/communication/conversations', { params });
    return data;
  },

  createConversation: async (payload) => {
    const { data } = await api.post('/communication/conversations', payload);
    return data;
  },

  getConversation: async (id) => {
    const { data } = await api.get(`/communication/conversations/${id}`);
    return data;
  },

  updateConversation: async (id, updates) => {
    const { data } = await api.patch(`/communication/conversations/${id}`, updates);
    return data;
  },

  getUnreadSummary: async () => {
    const { data } = await api.get('/communication/conversations/unread-summary');
    return data;
  },

  searchConversations: async (query) => {
    const { data } = await api.get('/communication/conversations/search', { params: { q: query } });
    return data;
  },

  getMessages: async (threadId, params = {}) => {
    const { data } = await api.get(`/communication/messages/${threadId}`, { params });
    return data;
  },

  sendMessage: async (formData) => {
    const { data } = await api.post('/communication/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  markAsRead: async (threadId) => {
    const { data } = await api.patch('/communication/messages/read', { threadId });
    return data;
  },

  deleteMessage: async (id) => {
    const { data } = await api.delete(`/communication/messages/${id}`);
    return data;
  },

  flagMessage: async (id, reason) => {
    const { data } = await api.post(`/communication/messages/${id}/flag`, { reason });
    return data;
  },

  voteOnPoll: async (messageId, optionIndex) => {
    const { data } = await api.put(`/communication/messages/${messageId}/vote`, { optionIndex });
    return data;
  },

  createTicket: async (payload) => {
    const { data } = await api.post('/communication/tickets', payload);
    return data;
  },

  getMyTickets: async (params = {}) => {
    const { data } = await api.get('/communication/tickets', { params });
    return data;
  },

  getAssignedTickets: async (params = {}) => {
    const { data } = await api.get('/communication/tickets/assigned', { params });
    return data;
  },

  getTicket: async (id) => {
    const { data } = await api.get(`/communication/tickets/${id}`);
    return data;
  },

  updateTicketStatus: async (id, payload) => {
    const { data } = await api.patch(`/communication/tickets/${id}/status`, payload);
    return data;
  },

  assignTicket: async (id, assignedTo) => {
    const { data } = await api.patch(`/communication/tickets/${id}/assign`, { assignedTo });
    return data;
  },

  addTicketNote: async (id, content) => {
    const { data } = await api.post(`/communication/tickets/${id}/note`, { content });
    return data;
  },

  escalateTicket: async (id, reason) => {
    const { data } = await api.post(`/communication/tickets/${id}/escalate`, { reason });
    return data;
  },

  rateTicket: async (id, rating, feedback) => {
    const { data } = await api.post(`/communication/tickets/${id}/rating`, { rating, feedback });
    return data;
  },

  getRequestTemplates: async () => {
    const { data } = await api.get('/communication/requests/templates');
    return data;
  },

  submitRequest: async (payload) => {
    const { data } = await api.post('/communication/requests', payload);
    return data;
  },

  getMyRequests: async (params = {}) => {
    const { data } = await api.get('/communication/requests', { params });
    return data;
  },

  getRequest: async (id) => {
    const { data } = await api.get(`/communication/requests/${id}`);
    return data;
  },

  updateRequestStatus: async (id, payload) => {
    const { data } = await api.patch(`/communication/requests/${id}/status`, payload);
    return data;
  },

  escalateRequest: async (id, reason) => {
    const { data } = await api.post(`/communication/requests/${id}/escalate`, { reason });
    return data;
  },

  getEscalations: async (params = {}) => {
    const { data } = await api.get('/communication/escalations', { params });
    return data;
  },

  getEscalation: async (id) => {
    const { data } = await api.get(`/communication/escalations/${id}`);
    return data;
  },

  resolveEscalation: async (id, resolution) => {
    const { data } = await api.patch(`/communication/escalations/${id}/resolve`, { resolution });
    return data;
  },

  forceEscalate: async (id, note) => {
    const { data } = await api.post(`/communication/escalations/${id}/escalate`, { note });
    return data;
  },

  getOfficeDetail: async (id) => {
    const { data } = await api.get(`/communication/offices/${id}`);
    return data;
  },

  getOfficeStaff: async (id) => {
    const { data } = await api.get(`/communication/offices/${id}/staff`);
    return data;
  },

  getQueueStatus: async (id) => {
    const { data } = await api.get(`/communication/offices/${id}/queue-status`);
    return data;
  }
};

export default communicationService;
