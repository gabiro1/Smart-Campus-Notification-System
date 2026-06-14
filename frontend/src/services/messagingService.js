import api from './apiClient';

const messagingService = {
  searchStudent: async (registrationNumber) => {
    const { data } = await api.get('/messages/search-student', { params: { regNo: registrationNumber } });
    return data;
  },

  getMyLecturers: async () => {
    const { data } = await api.get('/messages/my-lecturers');
    return data;
  },

  getMyClassmates: async () => {
    const { data } = await api.get('/student/classmates');
    return data;
  },

  getConversations: async () => {
    const { data } = await api.get('/communication/conversations');
    return data;
  },

  createConversation: async (payload) => {
    const body = {
      participants: [payload.participantId],
      threadType: payload.type || "direct",
      context: { type: "general" },
    };
    const { data } = await api.post('/communication/conversations', body);
    return data;
  },

  getConversation: async (id) => {
    const { data } = await api.get(`/communication/conversations/${id}`);
    return data;
  },

  getMessages: async (conversationId, params = {}) => {
    const { data } = await api.get(`/communication/messages/${conversationId}`, { params });
    return data;
  },

  sendMessage: async (formData) => {
    const { data } = await api.post('/communication/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  markAsRead: async (conversationId) => {
    const { data } = await api.patch('/communication/messages/read', { threadId: conversationId });
    return data;
  },

  editMessage: async (messageId, content) => {
    const { data } = await api.put(`/communication/messages/${messageId}`, { content });
    return data;
  },

  deleteMessage: async (messageId) => {
    const { data } = await api.delete(`/communication/messages/${messageId}`);
    return data;
  },

  archiveConversation: async (conversationId, isArchived = true) => {
    const { data } = await api.patch(`/communication/conversations/${conversationId}`, { isArchived });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/messages/unread-count');
    return data;
  },
};

export default messagingService;
