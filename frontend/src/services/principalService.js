import apiClient from "./apiClient";

const principalService = {
  getOverview: async () => {
    const r = await apiClient.get("/principal/overview");
    return r.data;
  },

  getDepartmentAnalytics: async () => {
    const r = await apiClient.get("/principal/departments");
    return r.data;
  },

  getCommunicationTrends: async (days = 14) => {
    const r = await apiClient.get(`/principal/communication-trends?days=${days}`);
    return r.data;
  },

  getApprovalAnalytics: async () => {
    const r = await apiClient.get("/principal/approval-analytics");
    return r.data;
  },
};

export default principalService;
