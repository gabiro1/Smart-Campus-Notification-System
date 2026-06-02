import apiClient from './apiClient';

const registrarService = {
  createStudent: async (data) => {
    const r = await apiClient.post('/registrar/students', data);
    return r.data;
  },

  importStudents: async (students) => {
    const r = await apiClient.post('/registrar/students/import', { students });
    return r.data;
  },

  getStudents: async (page = 1, limit = 50, filters = {}) => {
    const r = await apiClient.get('/registrar/students', {
      params: { page, limit, ...filters }
    });
    return r.data;
  },

  getStudent: async (id) => {
    const r = await apiClient.get(`/registrar/students/${id}`);
    return r.data;
  },

  updateStudent: async (id, data) => {
    const r = await apiClient.put(`/registrar/students/${id}`, data);
    return r.data;
  },

  toggleSuspendStudent: async (id) => {
    const r = await apiClient.put(`/registrar/students/${id}/toggle-suspend`);
    return r.data;
  },

  getEnrollmentStats: async () => {
    const r = await apiClient.get('/registrar/students/stats');
    return r.data;
  },

  previewRegNumber: async (department) => {
    const r = await apiClient.get('/registrar/students/preview-reg-number', {
      params: { department }
    });
    return r.data;
  },
};

export default registrarService;
