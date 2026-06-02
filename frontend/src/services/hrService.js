import apiClient from './apiClient';

const hrService = {
  getOverview: async () => {
    const r = await apiClient.get('/hr/overview');
    return r.data;
  },

  getStaffDrafts: async (status) => {
    const params = status ? { status } : {};
    const r = await apiClient.get('/hr/drafts', { params });
    return r.data;
  },

  createStaffDraft: async (data) => {
    const r = await apiClient.post('/hr/drafts', data);
    return r.data;
  },

  updateStaffDraft: async (id, data) => {
    const r = await apiClient.put(`/hr/drafts/${id}`, data);
    return r.data;
  },

  deleteStaffDraft: async (id) => {
    const r = await apiClient.delete(`/hr/drafts/${id}`);
    return r.data;
  },

  submitRoleAssignment: async (draftId) => {
    const r = await apiClient.post('/hr/assignments', { draftId });
    return r.data;
  },

  getMyRoleAssignments: async () => {
    const r = await apiClient.get('/hr/assignments/mine');
    return r.data;
  },

  getAllRoleAssignments: async (status) => {
    const params = status ? { status } : {};
    const r = await apiClient.get('/hr/assignments', { params });
    return r.data;
  },

  getPendingAssignments: async () => {
    const r = await apiClient.get('/principal/role-assignments/pending');
    return r.data;
  },

  approveAssignment: async (id) => {
    const r = await apiClient.put(`/principal/role-assignments/${id}/approve`);
    return r.data;
  },

  rejectAssignment: async (id, reason) => {
    const r = await apiClient.put(`/principal/role-assignments/${id}/reject`, { reason });
    return r.data;
  },

  activateAssignment: async (id) => {
    const r = await apiClient.post(`/principal/role-assignments/${id}/activate`);
    return r.data;
  },

  resendSetupEmail: async (id) => {
    const r = await apiClient.post(`/principal/role-assignments/${id}/resend-email`);
    return r.data;
  },
};

export default hrService;
