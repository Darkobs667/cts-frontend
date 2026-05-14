import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30s pour laisser le temps au cold start Render
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Ne pas boucler sur les routes d'auth elles-mêmes
        if (error.response?.status === 401 && !original._retry &&
            !original.url?.includes('/login') &&
            !original.url?.includes('/refresh-token')) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                }).catch(err => Promise.reject(err));
            }

            original._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('user_tokenrefresh');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/refresh-token`, { refresh_token: refreshToken });
                    const newToken = res.data.access_token;
                    localStorage.setItem('user_token', newToken);
                    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                    original.headers.Authorization = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return api(original);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('user_tokenrefresh');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                isRefreshing = false;
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
