import React, { useEffect, useState } from 'react';
import { voteService } from '../services/voteService';
import VoterLayout from '../Components/VoterLayout';
import { FileDown, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VoterVoteReceipts() {
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                setLoading(true);
                const data = await voteService.getMyVotes();
                setVotes(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error('Erreur lors de la récupération des votes:', err);
                setError('Impossible de charger vos votes.');
                setVotes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVotes();
    }, []);

    const handleDownloadReceipt = async (voteId) => {
        try {
            setDownloadingId(voteId);
            await voteService.downloadReceipt(voteId);
        } catch (err) {
            console.error('Erreur lors du téléchargement:', err);
            alert('Impossible de télécharger le reçu.');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <VoterLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Reçus de Vote</h1>
                    <p className="text-gray-600">Consultez et téléchargez vos reçus de vote au format PDF.</p>
                </div>

                {/* État de chargement */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                )}

                {/* Message d'erreur */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Aucun vote */}
                {!loading && !error && votes.length === 0 && (
                    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <CheckCircle2 className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun vote enregistré</h3>
                        <p className="text-gray-600">Vous n'avez pas encore voté. Rendez-vous sur la page des scrutins pour participer.</p>
                    </div>
                )}

                {/* Liste des votes */}
                {!loading && !error && votes.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {votes.map((vote) => (
                            <div
                                key={vote.id}
                                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Bande du haut avec couleur */}
                                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>

                                <div className="p-6">
                                    {/* Titre du scrutin */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {vote.election_title}
                                    </h3>

                                    {/* Info candidat avec photo */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex gap-4">
                                            {vote.photo_path ? (
                                                <img
                                                    src={vote.photo_path}
                                                    alt={vote.candidate_name}
                                                    className="w-20 h-24 object-cover rounded-md flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-20 h-24 bg-gray-300 rounded-md flex-shrink-0 flex items-center justify-center">
                                                    <span className="text-gray-600 text-xs text-center">Pas de photo</span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 mb-1">Candidat</p>
                                                <p className="font-medium text-gray-900">
                                                    {vote.candidate_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détails du vote */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="text-gray-600">
                                                {new Date(vote.date_voted).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            <span className="font-mono text-gray-900">
                                                {vote.transaction_ref}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bouton de téléchargement */}
                                    <button
                                        onClick={() => handleDownloadReceipt(vote.id)}
                                        disabled={downloadingId === vote.id}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FileDown size={18} />
                                        {downloadingId === vote.id ? 'Téléchargement...' : 'Télécharger le reçu PDF'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </VoterLayout>
    );
}
