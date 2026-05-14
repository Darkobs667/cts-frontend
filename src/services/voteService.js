// src/services/voteService.js
import api from './api';

export const voteService = {
    // Récupérer la liste des positions/élections
    getPositions: async () => {
        try {
            const response = await api.get('/positions');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Récupérer les candidats
    getCandidates: async (positionId) => {
        try {
            const response = positionId 
                ? await api.get(`/candidates?position_id=${positionId}`)
                : await api.get('/candidates');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Envoyer un vote
    submitVote: async (positionId, candidateId) => {
        try {
            const response = await api.post('/votes', {
                position_id: positionId,
                candidate_id: candidateId
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Récupérer les votes de l'utilisateur (historique)
    getMyVotes: async () => {
        try {
            const response = await api.get('/votes/my');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Télécharger un reçu de vote en PDF
    downloadReceipt: async (voteId) => {
        try {
            const response = await api.get(`/voter/receipt/${voteId}`, {
                responseType: 'blob'
            });
            
            // Créer un lien et déclencher le téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Recu_Vote_${voteId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Récupérer les résultats des votes
    getResults: async (positionId) => {
        try {
            const response = positionId
                ? await api.get(`/votes/results?position_id=${positionId}`)
                : await api.get('/votes/results');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};