import apiClient from "./apiClient";

const userService = {
  completeOnboarding: async (data) => {
    const response = await apiClient.put("/users/onboarding", data);
    return response.data;
  },

  searchUsers: async (query) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await apiClient.get(`/admin/users?search=${encodeURIComponent(query)}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export default userService;
