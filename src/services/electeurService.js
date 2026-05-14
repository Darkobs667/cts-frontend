import api from './api';

export const electeurService = {
    async getAll() {
        const response = await api.get('/users');
        const data = response.data.data || [];
        return data.map(u => ({
            ...u,
            nom: `${u.first_name} ${u.last_name}`.trim(),
        }));
    },

    async delete(id) {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};
