import axios from 'axios';
import toast from 'react-hot-toast';
// Utilise la variable d'environnement, avec une fallback pour le développement
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL:API_URL ,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
      || error.response?.data?.error
      || (error.request ? 'Le serveur est inaccessible. Vérifiez votre connexion.' : 'Une erreur inattendue est survenue.');

    // Keep form validation local: those messages are rendered next to the fields.
    if (error.response?.status !== 422) toast.error(message);
    return Promise.reject(error);
  },
);

export default api;
