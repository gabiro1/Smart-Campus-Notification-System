import apiClient from "./apiClient";

const messageService = {
  // 1️⃣ Get allowed contacts based on role/class assignment
  getContacts: async () => {
    try {
      const response = await apiClient.get("/messages/contacts");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      throw error;
    }
  },

  // 2️⃣ Fetch chat history with a specific person
  getMessages: async (otherUserId) => {
    try {
      const response = await apiClient.get(`/messages/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch messages with ${otherUserId}:`, error);
      throw error;
    }
  },

  // 3️⃣ Send a standard direct message (Text or File)
  sendMessage: async (receiverId, content, file = null) => {
    try {
      const formData = new FormData();
      formData.append("receiverId", receiverId);

      if (content) formData.append("content", content);
      if (file) formData.append("file", file);

      const response = await apiClient.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to send message to ${receiverId}:`, error);
      throw error;
    }
  },

  // 4️⃣ Vote on poll messages
  voteOnPoll: async (messageId, optionIndex) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}/vote`, { optionIndex });
      return response.data;
    } catch (error) {
      console.error(`Failed to vote on poll ${messageId}:`, error);
      throw error;
    }
  },

  // 5️⃣ NEW: Send official HOD/Admin Omnichannel Notification (Email + Push + DB)
  sendStaffNotification: async (notificationData) => {
    try {
      // payload expects: { targetUserId, email, name, fcmToken, message }
      const response = await apiClient.post("/messages/notify", notificationData);
      return response.data; // Expected output: { success: true, message: "..." }
    } catch (error) {
      console.error("Failed to send official staff notification:", error);
      throw error; // Re-throw so your React component can catch and display the toast
    }
  },

  // 6️⃣ Get Sent History for HOD
  getSentHistory: async (page = 1) => {
    try {
      const response = await apiClient.get(`/messages/history?page=${page}&limit=10`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch sent history:", error);
      throw error;
    }
  },
};

export default messageService;