import api from './api';

const candidateService = {
  async getAll() {
    const res = await api.get('/candidates');
    return res.data.data || res.data;
  },

  async create(formData) {
    // Ne pas forcer Content-Type — axios le détecte automatiquement avec le boundary correct
    const res = await api.post('/candidates', formData);
    return res.data;
  },

  async update(id, formData) {
    const res = await api.post(`/candidates/${id}/update`, formData);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/candidates/${id}`);
    return res.data;
  },
};

export default candidateService;