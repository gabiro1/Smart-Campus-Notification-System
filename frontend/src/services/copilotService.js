import apiClient from './apiClient';

const copilotService = {
  ask: async (query, context = {}) => {
    try {
      const response = await apiClient.post('/copilot/ask', { query, context });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get AI response');
    }
  },

  generateDigest: async (period = 'weekly') => {
    try {
      const response = await apiClient.get('/notifications/digest', { params: { period } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate digest');
    }
  },

  getDigestHistory: async () => {
    try {
      const response = await apiClient.get('/notifications/digest/latest');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get digest');
    }
  },

  summarizeContent: async (title, content, type = 'announcement') => {
    try {
      const response = await apiClient.post('/copilot/ask', {
        query: `Summarize and improve the following ${type}. Keep it professional and concise:\n\nTitle: ${title}\n\nContent: ${content}`,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate summary');
    }
  },

  paraphrase: async (text, tone = 'professional') => {
    try {
      const response = await apiClient.post('/ai/paraphrase', { text, tone });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to paraphrase text');
    }
  },

  suggestAnnouncement: async (rawText) => {
    try {
      const response = await apiClient.post('/ai/suggest-announcement', { rawText });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate announcement');
    }
  },
};

export default copilotService;