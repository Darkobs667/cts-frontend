import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const adminService = {
    getStats: async () => {
        const token = localStorage.getItem('user_token');
        return await axios.get(`${API_URL}/admin/stats-globales`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },


    // Pour créer l'élection (Position)
    createPosition: async (data) => {
        const token = localStorage.getItem('user_tokenrefsh');
        return await axios.post(`${API_URL}/positions`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // Pour ajouter un candidat à cette élection spécifique
    addCandidat: async (formData) => {
        const token = localStorage.getItem('user_tokenrefsh');
        return await axios.post(`${API_URL}/candidates`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Important pour les photos !
            }
        });
    }
};

export default adminService;