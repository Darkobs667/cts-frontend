import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { ChevronDown, ChevronUp, User, Vote, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ElecteurScrutins = () => {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [votedPositionIds, setVotedPositionIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [candidatesByPos, setCandidatesByPos] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/positions'),
      api.get('/votes/my'),
    ]).then(([posRes, votesRes]) => {
        if (posRes.data?.success) setPositions(posRes.data.data || []);
        const myVotes = Array.isArray(votesRes.data) ? votesRes.data : [];
        setVotedPositionIds(myVotes.map(v => v.position_id).filter(Boolean));
      })
      .catch(err => console.error("Erreur chargement des postes", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleCandidates = async (positionId) => {
    if (expandedId === positionId) { setExpandedId(null); return; }
    setExpandedId(positionId);
    if (!candidatesByPos[positionId]) {
      setLoadingCandidates(prev => ({ ...prev, [positionId]: true }));
      try {
        const res = await api.get('/candidates', { params: { position_id: positionId } });
        const data = (res.data.data || []).filter(c => c.status === 'valide');
        setCandidatesByPos(prev => ({
          ...prev,
          [positionId]: data.map(c => ({
            id: c.id,
            nom: c.user
              ? (`${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() || `Utilisateur #${c.user_id}`)
              : `Utilisateur #${c.user_id}`,
            slogan: c.slogan || c.bio || 'Pas de profession de foi',
            photo: c.photo_path ? `${import.meta.env.VITE_STORAGE_URL}/${c.photo_path}` : null,
          }))
        }));
      } catch (err) {
        console.error("Erreur chargement candidats", err);
      } finally {
        setLoadingCandidates(prev => ({ ...prev, [positionId]: false }));
      }
    }
  };

  return (
    <VoterLayout activePage="scrutins">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }
      `}</style>

      <div className="max-w-3xl mx-auto pb-20">

        <div className="mb-8 fade-up">
          <h1 className="text-xl md:text-2xl font-[900] text-slate-900">Tous les scrutins</h1>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Consultez les postes et leurs candidats
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
              <Vote className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase animate-pulse">
              Chargement des scrutins…
            </p>
          </div>

        ) : positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm fade-up">
            <div className="w-16 h-16 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
              <Vote size={24} className="text-slate-200" />
            </div>
            <p className="font-black text-slate-400 text-sm">Aucun scrutin trouvé.</p>
          </div>

        ) : (
          <div className="flex flex-col gap-3">
            {positions.map((pos, i) => {
              const isActive = pos.is_active === 1 || pos.is_active === true;
              const isExpanded = expandedId === pos.id;

              return (
                <div
                  key={pos.id}
                  className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300 fade-up
                    ${isExpanded ? 'border-emerald-100 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="p-5 md:p-6 flex items-start sm:items-center gap-4">

                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                      <Vote size={17} />
                    </div>

                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleCandidates(pos.id)}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-[900] text-slate-900 text-sm md:text-base leading-tight break-words">
                          {pos.title}
                        </h3>
                        {votedPositionIds.includes(pos.id) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <CheckCircle2 size={9} /> Voté
                          </span>
                        )}
                      </div>
                      {pos.description && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 break-words">{pos.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                          En cours
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black bg-slate-50 text-slate-400 border border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Inactif
                        </span>
                      )}

                      <button
                        onClick={() => toggleCandidates(pos.id)}
                        className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-50 bg-slate-50/40 p-5 md:p-6">
                      {loadingCandidates[pos.id] ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                      ) : candidatesByPos[pos.id]?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-12 h-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
                            <User size={18} className="text-slate-200" />
                          </div>
                          <p className="text-[11px] font-black text-slate-400">Aucun candidat pour ce poste.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {candidatesByPos[pos.id]?.map(cand => (
                            <div key={cand.id} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                {cand.photo ? (
                                  <img src={cand.photo} alt={cand.nom} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User size={18} className="text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-[900] text-sm text-slate-800 leading-tight truncate">{cand.nom}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cand.slogan}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VoterLayout>
  );
};

export default ElecteurScrutins;
