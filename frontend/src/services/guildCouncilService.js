import apiClient from './apiClient';

const guildCouncilService = {
  // Get the catalog of available guild council positions
  getPositions: async () => {
    const response = await apiClient.get('/guild-positions');
    return response.data;
  },

  // Admin: add a new guild council position to the catalog
  addPosition: async (name) => {
    const response = await apiClient.post('/guild-positions', { name });
    return response.data;
  },

  // Admin: remove a guild council position from the catalog
  deletePosition: async (id) => {
    const response = await apiClient.delete(`/guild-positions/${id}`);
    return response.data;
  },

  // Get all students currently holding a guild council position
  getMembers: async () => {
    const response = await apiClient.get('/guild-positions/members');
    return response.data;
  },

  // Admin: assign a guild council position to a student by registration number (immediate, no approval)
  assignPosition: async (registrationNumber, position) => {
    const response = await apiClient.post('/guild-positions/assign', { registrationNumber, position });
    return response.data;
  },

  // Admin: remove a student's guild council position
  removePosition: async (userId) => {
    const response = await apiClient.post(`/guild-positions/remove/${userId}`);
    return response.data;
  },
};

export default guildCouncilService;
