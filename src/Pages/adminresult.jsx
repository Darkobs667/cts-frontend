import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../Components/AdminLayout';
import {
  Users, TrendingUp, ShieldCheck, Loader2, User, Radio, Timer, FileDown
} from 'lucide-react';
import api from '../services/api';

/* ── Durée du scrutin en secondes (15 minutes) ── */
const DUREE_SCRUTIN = 50 * 60; // 900 secondes

/* ── Live dot ── */
const LiveDot = () => (
  <span className="relative inline-flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
  </span>
);

/* ── Animated counter ── */
const AnimatedNumber = ({ value, duration = 800 }) => {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = display;
    const end = Number(value);
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

/* ── Circular ring (participation) ── */
const RingProgress = ({ value }) => {
  const r = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke="url(#ringGradLight)" strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-3xl font-black text-slate-900 leading-none">
          <AnimatedNumber value={value} />%
        </span>
        <span className="text-[9px] font-bold tracking-widest text-slate-400 mt-1 uppercase">
          participation
        </span>
      </div>
    </div>
  );
};

/* ── Candidate row ── */
const CandidateRow = ({ c, index, votersCount, tickPulse }) => {
  const percent = votersCount > 0
    ? ((c.votes_count / votersCount) * 100).toFixed(1)
    : 0;
  const isLeader = index === 0 && c.votes_count > 0;

  return (
    <div className="group relative">
      {isLeader && (
        <span className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-emerald-500" />
      )}

      <div className="flex items-center gap-4 mb-3">
        <span className="text-[11px] font-black text-slate-300 w-4 shrink-0 text-right">
          {index + 1}
        </span>

        <div
          className={`w-11 h-11 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300
            ${isLeader ? 'border-emerald-400 shadow-md shadow-emerald-100' : 'border-slate-100'}`}
        >
          {c.photo_path ? (
            <img
              src={`${import.meta.env.VITE_STORAGE_URL}/${c.photo_path}`}
              className="w-full h-full object-cover"
              alt={c.name}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
              <User size={16} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-slate-800 truncate leading-tight">
            {c.name}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5">
            <AnimatedNumber value={c.votes_count} /> voix comptabilisées
            {tickPulse && isLeader && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </p>
        </div>

        <span
          className={`text-xl font-black tabular-nums ${
            isLeader ? 'text-emerald-600' : 'text-slate-900'
          }`}
        >
          {percent}%
        </span>
      </div>

      <div className="ml-9 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isLeader
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-200'
              : 'bg-slate-300'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

/* ── Main page ── */
const AdminresultsPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [totalInscrits, setTotalInscrits] = useState(0);
  const [tickPulse, setTickPulse] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(DUREE_SCRUTIN);
  const timerRef = useRef(null);

  /* ── Helper : arrêter le scrutin ── */
  const handleStopElection = async () => {
    if (!selectedElection) return;
    try {
      await api.put(`/positions/${selectedElection.id}`, {
        title: selectedElection.title,
        description: selectedElection.description || '',
        is_active: false,
      });
      setSelectedElection((prev) => (prev ? { ...prev, is_active: false } : null));
    } catch (error) {
      console.error("Erreur lors de la désactivation du scrutin", error);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ── Effet qui recalcul le temps restant à chaque changement de selectedElection ── */
  useEffect(() => {
    if (!selectedElection) return;

    if (!selectedElection.is_active) {
      setTimeLeft(0);
      stopTimer();
      return;
    }

    // Calcul à partir de started_at (ou updated_at en fallback)
    const start = selectedElection.started_at
      ? new Date(selectedElection.started_at).getTime()
      : new Date(selectedElection.updated_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    const remaining = Math.max(DUREE_SCRUTIN - elapsedSeconds, 0);

    setTimeLeft(remaining);

    if (remaining > 0) {
      stopTimer();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleStopElection();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Temps déjà écoulé → arrêt immédiat
      handleStopElection();
    }

    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElection?.id, selectedElection?.is_active, selectedElection?.started_at]);

  /* ── Chargement des résultats ── */
  const fetchResults = async () => {
    try {
      const response = await api.get('/votes/results');
      if (response.data?.success) {
        const elections = response.data.data;
        if (elections.length > 0) {
          setSelectedElection(elections[0]);
          setLastRefresh(new Date());
          setTickPulse(true);
          setTimeout(() => setTickPulse(false), 1200);
        }
      }
    } catch (error) {
      console.error('Erreur résultats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/admin/stats-globales');
      if (statsRes.data?.data) {
        setTotalInscrits(statsRes.data.data.totalInscrits || 0);
      }
    } catch (error) {
      console.warn('Impossible de récupérer les stats globales', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout activePage="results">
        <div className="flex h-[70vh] flex-col items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="mt-4 text-[10px] font-black text-slate-400 animate-pulse tracking-widest uppercase">
            Calcul des voix en temps réel...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!selectedElection) {
    return (
      <AdminLayout activePage="results">
        <div className="text-center py-20">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
            Aucun scrutin en cours.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const { title, total_votes, candidates, is_active } = selectedElection;
  const votersCount = total_votes;
  const participationRate = totalInscrits > 0
    ? ((votersCount / totalInscrits) * 100).toFixed(1)
    : 0;

  const sortedCandidates = [...candidates].sort((a, b) => b.votes_count - a.votes_count);
  const leader = sortedCandidates[0];

  return (
    <AdminLayout activePage="results">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .45s ease both; }

        @keyframes softGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
          50%       { box-shadow: 0 0 16px 4px rgba(16,185,129,.15); }
        }
        .soft-glow { animation: softGlow 2.8s ease-in-out infinite; }
      `}</style>

      <div className="animate-in fade-in duration-500">
        {/* header */}
        <div className="mb-8 fade-up flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LiveDot />
              <span className="text-[9px] font-black tracking-[0.2em] text-red-500 uppercase">
                Live
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                · mise à jour toutes les 10s
                {lastRefresh && ` · ${lastRefresh.toLocaleTimeString('fr-FR')}`}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">
              Résultats de {title}
            </h1>
          </div>

          {/* Timer + Statut + Bouton PDF */}
          <div className="flex items-center gap-3 flex-wrap">
            {is_active && (
              <div className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-200">
                <Timer size={20} className="animate-pulse" />
                <div>
                  <p className="text-[8px] font-black opacity-80 uppercase">Temps restant</p>
                  <p className="text-xl font-[900] tabular-nums leading-none">{formatTime(timeLeft)}</p>
                </div>
              </div>
            )}

            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase ${
                is_active
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${is_active ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}
              />
              {is_active ? 'En cours' : 'Clôturé'}
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-black text-xs"
            >
              <FileDown size={18} /> Exporter PDF
            </button>

            {leader && leader.votes_count > 0 && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 soft-glow">
                <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-emerald-400 shrink-0">
                  {leader.photo_path ? (
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${leader.photo_path}`}
                      className="w-full h-full object-cover"
                      alt={leader.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <User size={12} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[8px] font-black text-emerald-600 tracking-widest uppercase leading-none mb-0.5">
                    En tête
                  </p>
                  <p className="text-xs font-black text-slate-800">{leader.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* candidates panel */}
          <div
            className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm fade-up"
            style={{ animationDelay: '60ms' }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-300" />
                <h3 className="text-[11px] font-black text-slate-900 tracking-wide">
                  Répartition des voix
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                <Radio size={9} className="text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600">
                  <AnimatedNumber value={votersCount} /> votes
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {sortedCandidates.map((c, i) => (
                <CandidateRow
                  key={i}
                  c={c}
                  index={i}
                  votersCount={votersCount}
                  tickPulse={tickPulse}
                />
              ))}
            </div>

            <div className="mt-12 p-5 bg-emerald-50/50 rounded-[28px] border-2 border-dashed border-emerald-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] font-[900] text-emerald-700 mb-0.5">
                  Algorithme de dépouillement vérifié
                </p>
                <p className="text-[9px] font-bold text-emerald-600/60 leading-relaxed">
                  Anonymat strict, le double comptage est techniquement impossible.
                </p>
              </div>
            </div>
          </div>

          {/* stats panel */}
          <div
            className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-between gap-8 fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase self-start">
              Taux de participation
            </p>

            <RingProgress value={parseFloat(participationRate)} />

            <div className="w-full grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-2xl font-[900] text-slate-900 tabular-nums">
                  <AnimatedNumber value={votersCount} />
                </p>
                <p className="text-[8px] font-black text-slate-400 mt-1 tracking-widest uppercase">
                  Votants
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-2xl font-[900] text-slate-400 tabular-nums">
                  <AnimatedNumber value={totalInscrits} />
                </p>
                <p className="text-[8px] font-black text-slate-400 mt-1 tracking-widest uppercase">
                  Inscrits
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={11} className="text-slate-300" />
              <p className="text-[9px] font-bold text-slate-400">
                Les votes sont anonymes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminresultsPage;