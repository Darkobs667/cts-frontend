import api from './api';

const candidateService = {
  async getAll() {
    const res = await api.get('/candidates');
    // Adapte selon la structure de réponse (parfois res.data.data, parfois res.data)
    return res.data.data || res.data;
  },

  async create(formData) {
    const res = await api.post('/candidates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async update(id, formData) {
    const res = await api.post(`/candidates/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/candidates/${id}`);
    return res.data;
  },
};

export default candidateService;