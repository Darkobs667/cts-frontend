import api from './api';

const authService = {
    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                throw { error: "Le serveur met du temps à répondre (démarrage en cours). Réessayez dans quelques secondes." };
            }
            if (!error.response) {
                throw { error: "Impossible de contacter le serveur. Vérifiez votre connexion internet." };
            }
            throw error.response?.data ?? { error: "Erreur serveur inattendue." };
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            // Le backend retourne { message, data: { access_token, refresh_token, user } }
            const payload = response.data?.data ?? response.data;

            if (payload?.access_token) {
                localStorage.setItem('user_token', payload.access_token);
                localStorage.setItem('user_tokenrefresh', payload.refresh_token ?? '');
                localStorage.setItem('user_data', JSON.stringify(payload.user));
            }

            return payload;
        } catch (error) {
            throw error.response?.data ?? { error: "Erreur lors de la connexion au serveur." };
        }
    },

    logout: async () => {
        try { await api.post('/logout'); } catch (_) {}
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_tokenrefresh');
        localStorage.removeItem('user_data');
    }
};

export default authService;
