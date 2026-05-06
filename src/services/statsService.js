import api from './api';

export const statsService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard-stats');
        return response.data; 
        // Doit retourner { totalElecteurs, votesClotures, votesEnCours, participationRate, recentesElections: [] }
    }
};