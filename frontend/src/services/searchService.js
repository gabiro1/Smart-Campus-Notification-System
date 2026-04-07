import apiClient from './apiClient';

const searchService = {
  // Smart semantic search across events and announcements using AI intent extraction
  smartSearch: async (query) => {
    try {
      const response = await apiClient.get('/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Search failed");
    }
  }
};

export default searchService;
