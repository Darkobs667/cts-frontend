// src/services/voteService.js
import api from './api';

export const voteService = {
    // Récupérer la liste des élections
    getElections: async () => {
        const response = await api.get('/elections');
        return response.data;
    },

    // Envoyer un vote
    submitVote: async (electionId, candidateId) => {
        const response = await api.post(`/elections/${electionId}/vote`, {
            candidate_id: candidateId
        });
        return response.data;
    }
};