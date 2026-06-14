import apiClient from './apiClient';

const qaService = {
  askQuestion: async (announcementId, content) => {
    const { data } = await apiClient.post('/qa/ask', { announcementId, content });
    return data;
  },

  askQuestionForce: async (announcementId, content) => {
    const { data } = await apiClient.post('/qa/ask-force', { announcementId, content });
    return data;
  },

  getQuestionsForAnnouncement: async (announcementId) => {
    const { data } = await apiClient.get(`/qa/announcement/${announcementId}`);
    return data;
  },

  getMyQuestions: async () => {
    const { data } = await apiClient.get('/qa/my-questions');
    return data;
  },

  getLecturerQuestions: async () => {
    const { data } = await apiClient.get('/qa/lecturer-questions');
    return data;
  },

  answerQuestion: async (questionId, content) => {
    const { data } = await apiClient.post(`/qa/${questionId}/answer`, { content });
    return data;
  },

  getUnansweredCount: async () => {
    const { data } = await apiClient.get('/qa/unanswered-count');
    return data;
  },
};

export default qaService;
