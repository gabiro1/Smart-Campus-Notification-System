/**
 * governanceService.js
 * ---------------------
 * API service layer for the Announcement Governance Engine frontend.
 */

import apiClient from './apiClient.js';

const BASE = '/governance/announcements';

const governanceService = {
    /** Create a new governance announcement */
    create: (data) => apiClient.post(BASE, data).then((r) => r.data),

    /** Get published feed (all authenticated users) */
    getFeed: () => apiClient.get(`${BASE}/feed`).then((r) => r.data),

    /** Get pending announcements (HoD / Dean / Principal inbox) */
    getPending: () => apiClient.get(`${BASE}/pending`).then((r) => r.data),

    /** Get the current user's own announcements */
    getMine: () => apiClient.get(`${BASE}/mine`).then((r) => r.data),

    /** Approve or reject an announcement */
    review: (id, action, rejectionReason = '') =>
        apiClient
            .put(`${BASE}/${id}/review`, { action, rejectionReason })
            .then((r) => r.data),

    /** Get all departments */
    getDepartments: () => apiClient.get('/departments').then((r) => r.data),

    /** Delete a governance announcement */
    delete: (id) => apiClient.delete(`${BASE}/${id}`).then((r) => r.data),

    /** Update a governance announcement */
    update: (id, data) => apiClient.put(`${BASE}/${id}`, data).then((r) => r.data),
};

export default governanceService;
