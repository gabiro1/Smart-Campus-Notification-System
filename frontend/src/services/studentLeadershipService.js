import axios from "axios";

const API_URL = "/api/leadership";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const leadershipService = {
  getStats: async () => {
    const res = await axios.get(`${API_URL}/stats`, getAuthHeaders());
    return res.data;
  },

  getActiveGuildPresident: async () => {
    const res = await axios.get(`${API_URL}/guild-president/active`, getAuthHeaders());
    return res.data;
  },

  getPendingElections: async () => {
    const res = await axios.get(`${API_URL}/guild-president/pending`, getAuthHeaders());
    return res.data;
  },

  getElectionHistory: async (status) => {
    const params = status ? `?status=${status}` : "";
    const res = await axios.get(`${API_URL}/guild-president/history${params}`, getAuthHeaders());
    return res.data;
  },

  submitElectionResult: async (payload) => {
    const res = await axios.post(`${API_URL}/guild-president/election`, payload, getAuthHeaders());
    return res.data;
  },

  approveElection: async (id) => {
    const res = await axios.put(`${API_URL}/guild-president/${id}/approve`, {}, getAuthHeaders());
    return res.data;
  },

  rejectElection: async (id, reason) => {
    const res = await axios.put(`${API_URL}/guild-president/${id}/reject`, { reason }, getAuthHeaders());
    return res.data;
  },

  suspendGuildPresident: async (id, reason) => {
    const res = await axios.put(`${API_URL}/guild-president/${id}/suspend`, { reason }, getAuthHeaders());
    return res.data;
  },

  proposeClassRep: async (payload) => {
    const res = await axios.post(`${API_URL}/class-reps/propose`, payload, getAuthHeaders());
    return res.data;
  },

  getPendingClassReps: async () => {
    const res = await axios.get(`${API_URL}/class-reps/pending`, getAuthHeaders());
    return res.data;
  },

  getAllClassReps: async (status) => {
    const params = status ? `?status=${status}` : "";
    const res = await axios.get(`${API_URL}/class-reps/all${params}`, getAuthHeaders());
    return res.data;
  },

  getMyProposals: async () => {
    const res = await axios.get(`${API_URL}/class-reps/my-proposals`, getAuthHeaders());
    return res.data;
  },

  approveClassRep: async (id) => {
    const res = await axios.put(`${API_URL}/class-reps/${id}/approve`, {}, getAuthHeaders());
    return res.data;
  },

  rejectClassRep: async (id, reason) => {
    const res = await axios.put(`${API_URL}/class-reps/${id}/reject`, { reason }, getAuthHeaders());
    return res.data;
  },

  getActiveCouncil: async () => {
    const res = await axios.get(`${API_URL}/council/active`, getAuthHeaders());
    return res.data;
  },

  getPendingCouncilElections: async () => {
    const res = await axios.get(`${API_URL}/council/pending`, getAuthHeaders());
    return res.data;
  },

  getCouncilHistory: async (status) => {
    const params = status ? `?status=${status}` : "";
    const res = await axios.get(`${API_URL}/council/history${params}`, getAuthHeaders());
    return res.data;
  },

  submitCouncilElection: async (payload) => {
    const res = await axios.post(`${API_URL}/council/election`, payload, getAuthHeaders());
    return res.data;
  },

  approveCouncilElection: async (id) => {
    const res = await axios.put(`${API_URL}/council/${id}/approve`, {}, getAuthHeaders());
    return res.data;
  },

  rejectCouncilElection: async (id, reason) => {
    const res = await axios.put(`${API_URL}/council/${id}/reject`, { reason }, getAuthHeaders());
    return res.data;
  },

  suspendCouncil: async (id, reason) => {
    const res = await axios.put(`${API_URL}/council/${id}/suspend`, { reason }, getAuthHeaders());
    return res.data;
  },
};

export default leadershipService;
