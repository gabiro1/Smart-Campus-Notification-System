import apiClient from './apiClient';

const eventService = {
  // ── DRAFT WORKFLOW ─────────────────────────────────────────
  createDraft: async (data) => {
    const res = await apiClient.post('/events/draft', data);
    return res.data;
  },

  updateDraft: async (id, data) => {
    const res = await apiClient.put(`/events/draft/${id}`, data);
    return res.data;
  },

  submitForReview: async (id) => {
    const res = await apiClient.post(`/events/draft/${id}/submit`);
    return res.data;
  },

  // ── DIRECT PUBLISH (Guild Council / Principal / Admin) ────
  createAndPublish: async (data) => {
    const res = await apiClient.post('/events/publish', data);
    return res.data;
  },

  // ── REVIEW WORKFLOW ────────────────────────────────────────
  getReviewQueue: async (params = {}) => {
    const res = await apiClient.get('/events/review/queue', { params });
    return res.data;
  },

  getReviewQueueByStatus: async () => {
    const res = await apiClient.get('/events/review/queue/status');
    return res.data;
  },

  approveEvent: async (id, comment = '') => {
    const res = await apiClient.post(`/events/${id}/approve`, { comment });
    return res.data;
  },

  rejectEvent: async (id, reason) => {
    const res = await apiClient.post(`/events/${id}/reject`, { reason });
    return res.data;
  },

  requestRevision: async (id, comment) => {
    const res = await apiClient.post(`/events/${id}/request-revision`, { comment });
    return res.data;
  },

  publishApprovedEvent: async (id, comment = '') => {
    const res = await apiClient.post(`/events/${id}/publish`, { comment });
    return res.data;
  },

  scheduleEvent: async (id, scheduledDate, comment = '') => {
    const res = await apiClient.post(`/events/${id}/schedule`, { scheduledDate, comment });
    return res.data;
  },

  escalateEvent: async (id, comment = '') => {
    const res = await apiClient.post(`/events/${id}/escalate`, { comment });
    return res.data;
  },

  overrideDecision: async (id, newStatus, reason = '') => {
    const res = await apiClient.post(`/events/${id}/override`, { newStatus, reason });
    return res.data;
  },

  // ── DASHBOARD ──────────────────────────────────────────────
  getDashboardAnalytics: async () => {
    const res = await apiClient.get('/events/dashboard/analytics');
    return res.data;
  },

  getMyEvents: async (params = {}) => {
    const res = await apiClient.get('/events/dashboard/my-events', { params });
    return res.data;
  },

  // ── AUDIT ──────────────────────────────────────────────────
  getEventAudit: async (id) => {
    const res = await apiClient.get(`/events/${id}/audit`);
    return res.data;
  },

  // ── DISCOVERY ──────────────────────────────────────────────
  getFeed: async (page = 1, limit = 10) => {
    try {
      const res = await apiClient.get('/events/feed', { params: { page, limit } });
      let events = [];
      if (res.data) {
        if (Array.isArray(res.data)) events = res.data;
        else if (res.data.events) events = res.data.events;
        else if (res.data.data) events = res.data.data;
      }
      return events;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Could not load feed');
    }
  },

  getEvents: async (params = {}) => {
    const res = await apiClient.get('/events', { params });
    return res.data;
  },

  searchEvents: async (query) => {
    const res = await apiClient.get('/events/search', { params: { q: query } });
    return res.data;
  },

  getEventDetails: async (id) => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },

  getEventStats: async (id, includeAttendees = false) => {
    const res = await apiClient.get(`/events/${id}/stats?attended=${includeAttendees}`);
    return res.data;
  },

  // ── ACTIONS ────────────────────────────────────────────────
  cancelEvent: async (id, reason = '') => {
    const res = await apiClient.post(`/events/${id}/cancel`, { reason });
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  },

  // ── BOOKMARKS ──────────────────────────────────────────────
  getBookmarks: async (page = 1, limit = 20) => {
    const res = await apiClient.get('/events/bookmarks', { params: { page, limit } });
    return res.data;
  },

  toggleBookmark: async (eventId) => {
    const res = await apiClient.post(`/events/${eventId}/bookmark`);
    return res.data;
  },

  // ── RATING / INTEREST ─────────────────────────────────────
  rateEvent: async (eventId, rating) => {
    const res = await apiClient.post(`/events/${eventId}/rate`, { rating });
    return res.data;
  },

  expressInterest: async (eventId) => {
    const res = await apiClient.post(`/events/${eventId}/interest`);
    return res.data;
  },

  // ── FLYER PARSING ──────────────────────────────────────────
  parseFlyer: async (file) => {
    const formData = new FormData();
    formData.append('flyer', file);
    const res = await apiClient.post('/events/parse-flyer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // ── UPLOADS ────────────────────────────────────────────────
  uploadPoster: async (file, eventId = null) => {
    const formData = new FormData();
    formData.append('poster', file);
    const url = eventId ? `/events/upload/poster/${eventId}` : '/events/upload/poster';
    const res = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  uploadAttachment: async (file, eventId) => {
    const formData = new FormData();
    formData.append('attachment', file);
    const res = await apiClient.post(`/events/upload/attachment/${eventId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getAttachments: async (eventId) => {
    const res = await apiClient.get(`/events/${eventId}/attachments`);
    return res.data;
  },

  deleteAttachment: async (attachmentId) => {
    const res = await apiClient.delete(`/events/attachments/${attachmentId}`);
    return res.data;
  },

  // ── ATTENDANCE ─────────────────────────────────────────────
  scanAttendance: async (eventId, studentId) => {
    const res = await apiClient.post(`/events/${eventId}/scan-attendance`, { studentId });
    return res.data;
  },

  studentCheckIn: async (eventId, studentIdentifier) => {
    const res = await apiClient.post(`/events/${eventId}/check-in`, { studentIdentifier });
    return res.data;
  },

  // ── RSVP ───────────────────────────────────────────────────
  rsvp: async (eventId, status) => {
    const res = await apiClient.post('/events/rsvp', { eventId, status });
    return res.data;
  },

  updateRSVP: async (eventId, status) => {
    const res = await apiClient.put('/events/rsvp', { eventId, status });
    return res.data;
  },

  deleteRSVP: async (eventId) => {
    const res = await apiClient.delete('/events/rsvp', { data: { eventId } });
    return res.data;
  },

  getUserRSVP: async (eventId) => {
    const res = await apiClient.get(`/events/rsvp/${eventId}`);
    return res.data;
  },

  getAttendees: async (eventId) => {
    const res = await apiClient.get(`/events/rsvp/${eventId}/attendees`);
    return res.data;
  },

  // ── CALENDAR ───────────────────────────────────────────────
  exportCalendar: async (eventId) => {
    const res = await apiClient.get(`/events/${eventId}/calendar`, { responseType: 'blob' });
    return res.data;
  },

  // ── BACKWARD COMPATIBLE ALIASES ────────────────────────────
  createEvent: async (data) => {
    const res = await apiClient.post('/events/draft', data);
    return res.data;
  },

  updateEvent: async (id, data) => {
    const res = await apiClient.put(`/events/draft/${id}`, data);
    return res.data;
  },

  markInterested: async (eventId) => {
    const res = await apiClient.post(`/events/${eventId}/interest`);
    return res.data;
  },

  getAvailableTags: async () => {
    const res = await apiClient.get('/events/tags/available');
    return res.data;
  }
};

export default eventService;
