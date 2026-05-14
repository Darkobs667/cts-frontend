import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { useNavigate } from "react-router";
import { Vote, ArrowRight, ShieldCheck, Zap, CheckCircle2, Clock } from 'lucide-react';
import { getConnectedUser } from '../utils/userHelper';
import api from '../services/api';

const ElectionRow = ({ election, index, onVote, alreadyVoted }) => {
  const isActive = election.type === 'active';

  return (
    <div
      className="group relative flex flex-col md:grid md:grid-cols-4 gap-4 md:items-center
        p-5 md:px-7 md:py-6 rounded-2xl border border-transparent
        hover:bg-emerald-50/40 hover:border-emerald-100 transition-all duration-200 fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Vote size={13} className={isActive ? 'text-emerald-500' : 'text-slate-300'} />
        </div>
        <span className="font-black text-slate-800 text-sm leading-tight">{election.titre}</span>
      </div>

      {/* date */}
      <div>
        <span className="md:hidden text-[9px] font-black text-slate-300 mb-1 block">Date</span>
        <span className="text-slate-400 text-xs font-bold italic">{election.date}</span>
      </div>

      {/* status */}
      <div className="flex md:justify-center">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            En Cours
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-amber-50 text-amber-500 border border-amber-100">
            <Clock size={9} />
            Terminé
          </span>
        )}
      </div>

      {/* action */}
      <div className="md:text-right">
        {isActive ? (
          alreadyVoted ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black bg-slate-50 text-slate-400 border border-slate-100">
              <CheckCircle2 size={12} className="text-emerald-400" />
              Déjà voté
            </span>
          ) : (
            <button
              onClick={() => onVote(election)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600
                text-white rounded-2xl text-[10px] font-black shadow-sm shadow-emerald-100
                active:scale-95 transition-all duration-200"
            >
              Voter maintenant
              <ArrowRight size={13} />
            </button>
          )
        ) : (
          <span className="text-slate-300 text-[10px] font-black">Clôturé</span>
        )}
      </div>
    </div>
  );
};

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const [votedPositionIds, setVotedPositionIds] = useState([]);
  const user = getConnectedUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, myVotesRes] = await Promise.all([
          api.get('/positions'),
          api.get('/votes/my'),
        ]);

        if (posRes.data?.success) {
          const all = posRes.data.data || [];
          const mapped = all
            .filter(pos => pos.is_active === 1 || pos.is_active === true)
            .map(pos => ({
              id: pos.id,
              titre: pos.title,
              date: pos.closes_at
                ? new Date(pos.closes_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Date inconnue',
              type: 'active',
            }));
          setElections(mapped);
        }

        const myVotes = Array.isArray(myVotesRes.data) ? myVotesRes.data : [];
        setVotedPositionIds(myVotes.map(v => v.position_id).filter(Boolean));
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartVote = (election) => {
    navigate('/voterChoice', { state: { election } });
  };

  const totalScrutins = elections.length;
  const votesEffectues = votedPositionIds.length;
  const resteAVoter = Math.max(0, totalScrutins - votesEffectues);

  return (
    <VoterLayout activePage="dashboard">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }
      `}</style>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
            <Vote className="absolute text-emerald-500 animate-pulse" size={22} />
          </div>
          <p className="mt-6 text-[10px] font-[900] text-slate-400 animate-pulse tracking-widest uppercase">
            Synchronisation du registre…
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">

          {/* header */}
          <div className="mb-10 fade-up">
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">
              Tableau de bord électeur
            </h1>
            <p className="text-slate-400 font-medium mt-1 text-xs">
              Bienvenue{' '}
              <span className="font-black text-slate-600">{user?.fullName || 'Utilisateur'}</span>
              {' '}dans votre espace de vote sécurisé
            </p>
          </div>

          {/* stat cards — données pertinentes pour l'électeur */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Scrutins ouverts',   value: totalScrutins,  accent: 'bg-emerald-500 shadow-lg shadow-emerald-100', delay: '0ms'   },
              { label: 'Votes effectués',     value: votesEffectues, accent: 'bg-blue-500 shadow-lg shadow-blue-100',       delay: '60ms'  },
              { label: 'Reste à voter',       value: resteAVoter,    accent: resteAVoter > 0 ? 'bg-amber-500 shadow-lg shadow-amber-100' : 'bg-slate-400', delay: '120ms' },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 fade-up hover:shadow-md transition-all duration-300"
                style={{ animationDelay: s.delay }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.accent}`}>
                  <Vote size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">{s.label}</p>
                  <p className="text-2xl font-[900] text-slate-900 leading-none tabular-nums">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* elections table */}
          <div
            className="bg-white rounded-[36px] border border-slate-100 shadow-sm overflow-hidden fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <div className="px-7 py-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-[900] text-slate-900">Scrutins disponibles</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  {totalScrutins} scrutin{totalScrutins !== 1 ? 's' : ''} ouvert{totalScrutins !== 1 ? 's' : ''}
                </p>
              </div>
              {totalScrutins > 0 && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                  <Zap size={9} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-600">Live</span>
                </div>
              )}
            </div>

            <div className="hidden md:grid grid-cols-4 px-7 py-4 text-[9px] font-black text-slate-300 uppercase border-b border-slate-50">
              <div>Poste à pourvoir</div>
              <div>Date de clôture</div>
              <div>Statut</div>
              <div className="text-right">Action</div>
            </div>

            <div className="px-2 py-2">
              {elections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                    <Vote size={26} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-black text-sm">Aucun scrutin ouvert</p>
                  <p className="text-slate-300 font-bold text-[10px] mt-1">Revenez plus tard pour voter</p>
                </div>
              ) : (
                elections.map((election, i) => (
                  <ElectionRow
                    key={election.id}
                    election={election}
                    index={i}
                    onVote={handleStartVote}
                    alreadyVoted={votedPositionIds.includes(election.id)}
                  />
                ))
              )}
            </div>

            <div className="px-7 py-4 border-t border-slate-50 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" />
              <p className="text-[9px] font-bold text-slate-300">
                Registre audité — votes anonymisés par Cyber Tech Squad
              </p>
            </div>
          </div>

        </div>
      )}
    </VoterLayout>
  );
};

export default VoterDashboard;
