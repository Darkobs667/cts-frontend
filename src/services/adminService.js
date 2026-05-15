import api from './api';

const adminService = {
    getStats: () => api.get('/admin/stats-globales'),
    getParticipationByPosition: () => api.get('/admin/participation-by-position'),
    getExpiringPositions: () => api.get('/admin/expiring-positions'),
    togglePosition: (id) => api.patch(`/admin/positions/${id}/toggle`),

    createPosition: (data) => api.post('/positions', data),
    updatePosition: (id, data) => api.put(`/positions/${id}`, data),
    addCandidat: (formData) => api.post('/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default adminService;
