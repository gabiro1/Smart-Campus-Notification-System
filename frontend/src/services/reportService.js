import apiClient from './apiClient.js';

const BASE = '/governance/reports';

const reportService = {
  // ── Authoring ──
  create: (data) => apiClient.post(BASE, data).then(r => r.data),
  submit: (id) => apiClient.put(`${BASE}/${id}/submit`).then(r => r.data),
  getMine: () => apiClient.get(`${BASE}/mine`).then(r => r.data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data),

  // ── Dean Review ──
  getPendingReview: () => apiClient.get(`${BASE}/pending-review`).then(r => r.data),
  getReport: (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  startReview: (id) => apiClient.put(`${BASE}/${id}/start-review`).then(r => r.data),
  approveReport: (id, comments = '') => apiClient.put(`${BASE}/${id}/approve`, { comments }).then(r => r.data),
  rejectReport: (id, comments = '') => apiClient.put(`${BASE}/${id}/reject`, { comments }).then(r => r.data),
  requestRevision: (id, comments) => apiClient.put(`${BASE}/${id}/request-revision`, { comments }).then(r => r.data),
  acknowledgeReport: (id, comments = '') => apiClient.put(`${BASE}/${id}/acknowledge`, { comments }).then(r => r.data),
  escalateReport: (id, comments) => apiClient.put(`${BASE}/${id}/escalate`, { comments }).then(r => r.data),
  addNote: (id, comments) => apiClient.post(`${BASE}/${id}/notes`, { comments }).then(r => r.data),

  // ── Analytics ──
  getApproved: (params = {}) => apiClient.get(`${BASE}/approved`, { params }).then(r => r.data),
  getAnalytics: () => apiClient.get(`${BASE}/analytics`).then(r => r.data),
};

export default reportService;
