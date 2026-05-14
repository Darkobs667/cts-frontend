import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('user_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refreshToken = localStorage.getItem('user_tokenrefsh');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/refresh-token`, { refresh_token: refreshToken });
                    const newToken = res.data.access_token;
                    localStorage.setItem('user_token', newToken);
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return api(original);
                } catch {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('user_tokenrefsh');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
