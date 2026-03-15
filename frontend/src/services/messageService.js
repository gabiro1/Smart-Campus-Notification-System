import apiClient from "./apiClient";

const messageService = {
  // 1️⃣ Get allowed contacts based on role/class assignment
  getContacts: async () => {
    try {
      const response = await apiClient.get("/messages/contacts");
      // response contains only the people the user is allowed to message
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

  // 3️⃣ Send a message (Text or File)
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

  // 4️⃣ Optional: Vote on poll messages
  voteOnPoll: async (messageId, optionIndex) => {
    try {
      const response = await apiClient.put(`/messages/${messageId}/vote`, { optionIndex });
      return response.data;
    } catch (error) {
      console.error(`Failed to vote on poll ${messageId}:`, error);
      throw error;
    }
  }
};

export default messageService;