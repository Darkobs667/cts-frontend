import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import AdminLayout from '../Components/AdminLayout';
import StatCard from '../Components/StatCard';
import { Users, Vote, CheckCircle, Clock, Loader2, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import adminService from '../services/adminService';
import api from '../services/api';

/* ── Stat card ── */
const ModernStatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <div
    className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4
      hover:shadow-md hover:border-slate-200 transition-all duration-300 fade-up"
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1 leading-none">
        {label}
      </p>
      <p className="text-2xl font-[900] text-slate-900 leading-none tabular-nums">{value}</p>
    </div>
  </div>
);

/* ── Election row (desktop) ── */
const ElectionRow = ({ election, index }) => {
  const isActive = election.statut === 'Actif';
  return (
    <div
      className="group relative flex flex-col md:grid md:grid-cols-4 gap-3 md:items-center
        p-4 md:px-6 md:py-5 rounded-2xl border border-transparent
        hover:bg-emerald-50/40 hover:border-emerald-100 transition-all duration-200 fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* left accent */}
      <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Vote size={13} className={isActive ? 'text-emerald-500' : 'text-slate-300'} />
        </div>
        <span className="font-black text-slate-800 text-sm leading-tight">{election.titre}</span>
      </div>

      {/* status */}
      <div className="flex md:justify-start">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-slate-50 text-slate-400 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Inactif
          </span>
        )}
      </div>

      {/* date */}
      <div className="flex items-center gap-1.5">
        <Calendar size={11} className="text-slate-300 shrink-0" />
        <span className="text-xs font-bold text-slate-400 ">
          {new Date(election.date_fin).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </span>
      </div>

      {/* action */}
      <div className="md:text-right">
        <Link
          to="/votes-elections"
          className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-400
            hover:text-emerald-500 transition-colors group/link"
        >
          Détails
          <ArrowRight size={11} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

/* ── Main page ── */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInscrits: 0,
    votesClotures: 0,
    votesEnCours: 0,
    participation: '0%',
  });
  const [recentElections, setRecentElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des stats :", error);
    }
  };

  const fetchRecentElections = async () => {
    try {
      const response = await api.get('/positions');
      if (response.data && response.data.success) {
        const all = [...(response.data.data || []), ...(response.data.failed || [])];
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const recent = all.slice(0, 4).map((election) => ({
          id: election.id,
          titre: election.title,
          statut: election.is_active == 1 ? 'Actif' : 'Inactif',
          date_fin: election.created_at,
        }));
        setRecentElections(recent);
      }
    } catch (error) {
      console.error("Erreur chargement scrutins récents :", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchRecentElections()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: 'Électeurs inscrits',    value: stats.totalInscrits.toLocaleString(), icon: Users,       accent: 'bg-emerald-500 shadow-lg shadow-emerald-100', delay: '0ms'   },
    { label: 'Votes inactifs',        value: stats.votesClotures,                  icon: CheckCircle, accent: 'bg-blue-500 shadow-lg shadow-blue-100',    delay: '60ms'  },
    { label: 'Votes en cours',        value: stats.votesEnCours,                   icon: Clock,       accent: 'bg-amber-500 shadow-lg shadow-amber-100',   delay: '120ms' },
    { label: 'Taux de participation', value: stats.participation,                  icon: TrendingUp,  accent: 'bg-purple-500 shadow-lg shadow-purple-100', delay: '180ms' },
  ];

  return (
    <AdminLayout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }
      `}</style>

      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">

        {/* ── header ── */}
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <h2 className="text-xl md:text-2xl font-[900] text-slate-900">Tableau de bord</h2>
            <p className="text-slate-400 font-medium text-xs mt-1">Vue d'ensemble de la plateforme</p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="animate-spin text-emerald-500" size={16} />
              <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
                Actualisation…
              </span>
            </div>
          )}
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <ModernStatCard key={i} {...s} />
          ))}
        </div>

        {/* ── recent elections ── */}
        <div
          className="bg-white rounded-[36px] border border-slate-100 shadow-sm overflow-hidden fade-up"
          style={{ animationDelay: '240ms' }}
        >
          {/* panel header */}
          <div className="px-7 py-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-[900] text-slate-900">
                Scrutins récents
                {recentElections.length > 0 && (
                  <span className="ml-2 text-[9px] font-black text-slate-300">
                    ({recentElections.length})
                  </span>
                )}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                Dernières élections enregistrées
              </p>
            </div>
            <Link
              to="/votes-elections"
              className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600
                hover:text-emerald-700 transition-colors group"
            >
              Voir tout
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* column labels */}
          {recentElections.length > 0 && (
            <div className="hidden md:grid grid-cols-4 px-7 py-4 text-[9px] font-black text-slate-300 tracking-widest uppercase border-b border-slate-50">
              <div>Titre de l'élection</div>
              <div>Statut</div>
              <div>Date de création</div>
              <div className="text-right">Action</div>
            </div>
          )}

          {/* rows */}
          <div className="px-2 py-2">
            {isLoading && recentElections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase animate-pulse">
                  Chargement…
                </p>
              </div>
            ) : recentElections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-[22px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                  <Vote size={22} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-black text-sm">Aucune élection</p>
                <p className="text-slate-300 font-bold text-[10px] mt-1">
                  Aucune élection enregistrée pour le moment
                </p>
              </div>
            ) : (
              <>
                {/* mobile cards */}
                <div className="md:hidden space-y-3 p-2">
                  {recentElections.map((election, i) => {
                    const isActive = election.statut === 'Actif';
                    return (
                      <div
                        key={election.id}
                        className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 fade-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="font-black text-sm text-slate-800 leading-tight">{election.titre}</span>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black bg-slate-100 text-slate-400 shrink-0">
                              Inactif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 font-bold">
                            {new Date(election.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <Link to="/votes-elections" className="text-emerald-500 font-black text-[10px] flex items-center gap-1">
                            Détails <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* desktop rows */}
                <div className="hidden md:block">
                  {recentElections.map((election, i) => (
                    <ElectionRow key={election.id} election={election} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;