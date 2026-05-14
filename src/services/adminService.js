import api from './api';



const adminService = {
    getStats: async () => {
        return await api.get(`/admin/stats-globales`);
    },

    createPosition: async (data) => {
        return await api.post(`/positions`, data);
    },

    addCandidat: async (formData) => {
        return await api.post(`/candidates`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default adminService;