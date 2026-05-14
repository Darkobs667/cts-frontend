import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { useNavigate } from "react-router";
import { Vote, ArrowRight, ShieldCheck, Zap, CheckCircle2, Clock, Timer } from 'lucide-react';
import { getConnectedUser } from '../utils/userHelper';
import api from '../services/api';

/* ── Countdown temps réel ── */
const Countdown = ({ closesAt }) => {
  const calc = () => {
    const diff = new Date(closesAt) - new Date();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, urgent: diff < 3600000 };
  };
  const [time, setTime] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [closesAt]);

  if (!time) return <span className="text-[9px] font-black text-slate-300">Clôturé</span>;

  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black ${time.urgent ? 'text-red-500' : 'text-slate-400'}`}>
      <Timer size={9} className={time.urgent ? 'text-red-400' : 'text-slate-300'} />
      {time.h > 0 && `${time.h}h `}{String(time.m).padStart(2,'0')}m {String(time.s).padStart(2,'0')}s
    </span>
  );
};

/* ── Barre de progression ── */
const ProgressBar = ({ value, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Progression de vote</span>
        <span className="text-[9px] font-black text-emerald-600">{value}/{total} scrutins</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[9px] font-bold text-slate-400 mt-1.5 text-right">
        {pct === 100 ? '✓ Tous les scrutins complétés !' : `${pct}% accompli`}
      </p>
    </div>
  );
};

/* ── Ligne scrutin ── */
const ElectionRow = ({ election, index, onVote, alreadyVoted }) => (
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
        <Vote size={13} className={alreadyVoted ? 'text-emerald-500' : 'text-slate-300'} />
      </div>
      <div className="min-w-0">
        <span className="font-black text-slate-800 text-sm leading-tight block truncate">{election.titre}</span>
        {alreadyVoted && (
          <span className="text-[8px] font-black text-emerald-500 tracking-wide">✓ Participation enregistrée</span>
        )}
      </div>
    </div>

    {/* countdown */}
    <div>
      <span className="md:hidden text-[9px] font-black text-slate-300 mb-1 block">Clôture</span>
      {election.closesAt ? <Countdown closesAt={election.closesAt} /> : (
        <span className="text-slate-400 text-xs font-bold italic">{election.date}</span>
      )}
    </div>

    {/* status */}
    <div className="flex md:justify-center">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        En Cours
      </span>
    </div>

    {/* action */}
    <div className="md:text-right">
      {alreadyVoted ? (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} />
          Voté
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
      )}
    </div>
  </div>
);

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
              closesAt: pos.closes_at || null,
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

  const totalScrutins = elections.length;
  const votesEffectues = votedPositionIds.filter(id => elections.some(e => e.id === id)).length;
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
          <div className="mb-8 fade-up">
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">Tableau de bord</h1>
            <p className="text-slate-400 font-medium mt-1 text-xs">
              Bienvenue <span className="font-black text-slate-600">{user?.fullName || 'Utilisateur'}</span>
            </p>
          </div>

          {/* barre de progression globale */}
          {totalScrutins > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6 fade-up" style={{ animationDelay: '40ms' }}>
              <ProgressBar value={votesEffectues} total={totalScrutins} />
            </div>
          )}

          {/* stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Scrutins ouverts', value: totalScrutins,  accent: 'bg-emerald-500 shadow-lg shadow-emerald-100', delay: '60ms'  },
              { label: 'Votes effectués',  value: votesEffectues, accent: 'bg-blue-500 shadow-lg shadow-blue-100',       delay: '120ms' },
              { label: 'Reste à voter',    value: resteAVoter,    accent: resteAVoter > 0 ? 'bg-amber-500 shadow-lg shadow-amber-100' : 'bg-slate-300', delay: '180ms' },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 fade-up hover:shadow-md transition-all duration-300"
                style={{ animationDelay: s.delay }}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.accent}`}>
                  <Vote size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1 leading-none">{s.label}</p>
                  <p className="text-2xl font-[900] text-slate-900 leading-none tabular-nums">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* liste scrutins */}
          <div className="bg-white rounded-[36px] border border-slate-100 shadow-sm overflow-hidden fade-up" style={{ animationDelay: '200ms' }}>
            <div className="px-7 py-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-[900] text-slate-900">Scrutins disponibles</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  {resteAVoter > 0 ? `${resteAVoter} scrutin${resteAVoter > 1 ? 's' : ''} en attente de votre vote` : 'Tous les scrutins complétés'}
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
              <div>Clôture dans</div>
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
                    onVote={(el) => navigate('/voterChoice', { state: { election: el } })}
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
