import api from './api';



const authService = {
    //  fonction d'inscription 
    register: async (userData) => {
        try {
            const response = await api.post(`/register`, userData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw new Error("Impossible de contacter le serveur de vote.");
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post(`/login`, credentials);
            const backendData = response.data?.data ?? response.data;

            if (backendData && backendData.access_token) {
                localStorage.setItem('user_token', backendData.access_token);
                if (backendData.refresh_token) {
                    localStorage.setItem('user_tokenrefsh', backendData.refresh_token);
                }
                localStorage.setItem('user_data', JSON.stringify(backendData.user));
            }

            // Retourner toujours l'objet data pour que Login.jsx puisse lire access_token et user
            return backendData;
        } catch (error) {
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw new Error("Erreur lors de la connexion au serveur.");
        }
    },

    logout: async () => {
        try { await api.post('/logout'); } catch (_) {}
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_tokenrefsh');
        localStorage.removeItem('user_data');
    }
};

export default authService;