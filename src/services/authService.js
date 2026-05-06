import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const authService = {
    //  fonction d'inscription 
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
            }
            
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw error.response.data; 
            }
            throw new Error("Impossible de contacter le serveur de vote.");
        }
    },

    // TA NOUVELLE FONCTION DE CONNEXION
   login: async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // On extrait les données utiles tout de suite
        // Laravel met souvent les infos dans response.data.data
        const backendData = response.data.data; 

        if (backendData && backendData.access_token) {
            localStorage.setItem('user_token', backendData.access_token);
            localStorage.setItem('user_data', JSON.stringify(backendData.user));
        }

        // On retourne uniquement la partie utile du JSON
        return response.data; 
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;
        }
        throw new Error("Erreur lors de la connexion au serveur.");
    }
},

    // Optionnel : Fonction de déconnexion pour nettoyer le localStorage
    logout: () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
    }
};

export default authService;