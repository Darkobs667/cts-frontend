import api from './api';



const adminService = {
    getStats: async () => {
        const token = localStorage.getItem('user_token');
        return await api.get(`/admin/stats-globales`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },


    // Pour créer l'élection (Position)
    createPosition: async (data) => {
        const token = localStorage.getItem('user_tokenrefsh');
        return await api.post(`/positions`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Pour ajouter un candidat à cette élection spécifique
    addCandidat: async (formData) => {
        const token = localStorage.getItem('user_tokenrefsh');
        return await api.post(`/candidates`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Important pour les photos !
            }
        });
    }
};

export default adminService;