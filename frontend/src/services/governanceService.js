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
};

export default governanceService;
