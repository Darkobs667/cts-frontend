import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { useNavigate } from "react-router";
import { Users, Vote, CheckCircle, Clock, ArrowRight, ShieldCheck, Zap, CheckSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/* ── Stat card redesigned ── */
const ModernStatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 fade-up hover:shadow-md hover:border-slate-200 transition-all duration-300">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">{label}</p>
      <p className="text-2xl font-[900] text-slate-900 leading-none tabular-nums">{value}</p>
    </div>
  </div>
);

/* ── Election row avec bouton Déjà voté ── */
const ElectionRow = ({ election, index, onVote, hasVoted }) => {
  const isActive = election.type === 'active';

  return (
    <div
      className="group relative flex flex-col md:grid md:grid-cols-5 gap-4 md:items-center
        p-5 md:px-7 md:py-6 rounded-2xl border border-transparent
        hover:bg-emerald-50/40 hover:border-emerald-100 transition-all duration-200 fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex items-center gap-3 md:col-span-2">
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Vote size={13} className={isActive && !hasVoted ? 'text-emerald-500' : 'text-slate-300'} />
        </div>
        <span className="font-black text-slate-800 text-sm leading-tight">{election.titre}</span>
      </div>

      <div>
        <span className="md:hidden text-[9px] font-black text-slate-300 mb-1 block">Date</span>
        <span className="text-slate-400 text-xs font-bold italic">{election.date}</span>
      </div>

      <div className="flex md:justify-center">
        {hasVoted ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-green-50 text-green-600 border border-green-100">
            <CheckSquare size={10} />
            Déjà voté
          </span>
        ) : isActive ? (
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

      <div className="md:text-right">
        {isActive && !hasVoted ? (
          <button
            onClick={() => onVote(election)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600
              text-white rounded-2xl text-[10px] font-black shadow-sm shadow-emerald-100
              active:scale-95 transition-all duration-200"
          >
            Voter maintenant
            <ArrowRight size={13} />
          </button>
        ) : hasVoted ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400
            rounded-2xl text-[10px] font-black cursor-not-allowed">
            <CheckSquare size={12} />
            Vote enregistré
          </span>
        ) : (
          <span className="text-slate-300 text-[10px] font-black">Fermé</span>
        )}
      </div>
    </div>
  );
};

/* ── Main page ── */
const VoterDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    votesClotures: 0,
    votesEnCours: 0,
    participation: '0%',
  });
  const [elections, setElections] = useState([]);
  const [userVotedIds, setUserVotedIds] = useState([]);

  // Récupérer les votes déjà effectués par l'utilisateur
  const fetchUserVotes = async () => {
    try {
      const response = await api.get('/votes/my');
      if (response.data && response.data.data) {
        const votedIds = response.data.data.map(vote => vote.position_id);
        setUserVotedIds(votedIds);
        return votedIds;
      }
    } catch (error) {
      console.warn("Impossible de récupérer les votes:", error);
    }
    return [];
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Récupérer les votes existants de l'utilisateur
        await fetchUserVotes();

        // 2. Récupérer les stats globales
        try {
          const statsRes = await api.get('/admin/stats-globales');
          if (statsRes.data?.data) {
            setStats({
              votesClotures: statsRes.data.data.votesClotures || 0,
              votesEnCours: statsRes.data.data.votesEnCours || 0,
              participation: statsRes.data.data.participation || '0',
            });
          }
        } catch (error) {
          console.warn("Stats non disponibles", error);
        }

        // 3. Récupérer les élections actives
        try {
          const posRes = await api.get('/positions');
          if (posRes.data?.success) {
            const allPositions = [
              ...(posRes.data.data || []),
              ...(posRes.data.failed || []),
            ];
            
            const activeElections = allPositions
              .filter(pos => pos.is_active == 1)
              .map(pos => ({
                id: pos.id,
                titre: pos.title,
                date: pos.updated_at
                  ? new Date(pos.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                  : 'Date inconnue',
                type: 'active',
                created_at: pos.created_at,
              }))
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setElections(activeElections);
          }
        } catch (error) {
          console.error("Erreur chargement des positions", error);
        }

      } catch (error) {
        console.error("Erreur de synchronisation :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleStartVote = (election) => {
    navigate('/voterChoice', { state: { election } });
  };

  const userFullName = user ? `${user.first_name} ${user.last_name}` : 'Utilisateur';
  const isLoading = authLoading || loading;

  return (
    <VoterLayout activePage="dashboard">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }
      `}</style>

      {isLoading ? (
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

          {/* ── header ── */}
          <div className="mb-10 fade-up">
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">
              Tableau de bord électeur
            </h1>
            <p className="text-slate-400 font-medium mt-1 text-xs">
              Bienvenue{' '}
              <span className="font-black text-slate-600">{userFullName}</span>
              {' '}dans votre espace de vote sécurisé
            </p>
          </div>

          {/* ── stat cards (sans Électeurs inscrits) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ModernStatCard 
              label="Votes clôturés" 
              value={stats.votesClotures || 0} 
              icon={CheckCircle} 
              accent="bg-blue-500 shadow-lg shadow-blue-100" 
            />
            <ModernStatCard 
              label="Votes en cours" 
              value={stats.votesEnCours || 0} 
              icon={Clock} 
              accent="bg-amber-500 shadow-lg shadow-amber-100" 
            />
            <ModernStatCard 
              label="Participation" 
              value={`${stats.participation || 0}%`} 
              icon={Vote} 
              accent="bg-purple-500 shadow-lg shadow-purple-100" 
            />
          </div>

          {/* ── Liste des scrutins ── */}
          <div
            className="bg-white rounded-[36px] border border-slate-100 shadow-sm overflow-hidden fade-up"
            style={{ animationDelay: '220ms' }}
          >
            <div className="px-7 py-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-[900] text-slate-900">Scrutins disponibles</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  {elections.length} scrutin{elections.length !== 1 ? 's' : ''} ouvert{elections.length !== 1 ? 's' : ''}
                </p>
              </div>
              {elections.length > 0 && (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                  <Zap size={9} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-600">Live</span>
                </div>
              )}
            </div>

            <div className="hidden md:grid grid-cols-5 px-7 py-4 text-[9px] font-black text-slate-300 uppercase border-b border-slate-50">
              <div className="col-span-2">Poste à pourvoir</div>
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
                  <p className="text-slate-300 font-bold text-[10px] mt-1">
                    Revenez plus tard pour voter
                  </p>
                </div>
              ) : (
                elections.map((election, i) => (
                  <ElectionRow
                    key={election.id}
                    election={election}
                    index={i}
                    onVote={handleStartVote}
                    hasVoted={userVotedIds.includes(election.id)}
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