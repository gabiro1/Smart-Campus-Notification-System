import apiClient from "./apiClient";

/**
 * User service for user-specific endpoints
 */

const userService = {
  // Complete first-login onboarding
  completeOnboarding: async (data) => {
    const response = await apiClient.put("/users/onboarding", data);
    return response.data;
  },

  // Get user profile (already exists in authService but we can re-export if needed)
  // getProfile: async () => { ... }
};

export default userService;
