import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../Components/AdminLayout';
import {
  Users, TrendingUp, ShieldCheck, Loader2, User, Radio, Timer, FileDown, XCircle, Printer, ClipboardList, Wifi, MapPin
} from 'lucide-react';
import api from '../services/api';

/* ── Composants utilitaires (inchangés) ── */
const LiveDot = () => (
  <span className="relative inline-flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
  </span>
);

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
  }, [value]);
  return <>{display.toLocaleString()}</>;
};

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

const CandidateRow = ({ c, index, votersCount, tickPulse, isActive, hasPhysical }) => {
  const onlinePct  = votersCount > 0 ? ((c.online_votes  / votersCount) * 100).toFixed(1) : 0;
  const physPct    = votersCount > 0 ? ((c.physical_votes / votersCount) * 100).toFixed(1) : 0;
  const totalPct   = votersCount > 0 ? ((c.votes_count    / votersCount) * 100).toFixed(1) : 0;
  const isLeader   = index === 0 && c.votes_count > 0;
  const showSplit  = !isActive && hasPhysical;

  return (
    <div className="group relative">
      {isLeader && <span className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-emerald-500" />}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-[11px] font-black text-slate-300 w-4 shrink-0 text-right">{index + 1}</span>
        <div className={`w-11 h-11 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${isLeader ? 'border-emerald-400' : 'border-slate-100'}`}>
          {c.photo_path ? (
            <img src={c.photo_path} className="w-full h-full object-cover" alt={c.name} />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={16} /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-slate-800 truncate leading-tight">{c.name}</h4>
          {showSplit ? (
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-[9px] font-black text-blue-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                <AnimatedNumber value={c.online_votes} /> en ligne
              </span>
              <span className="flex items-center gap-1 text-[9px] font-black text-amber-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <AnimatedNumber value={c.physical_votes} /> physique
              </span>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5">
              <AnimatedNumber value={c.online_votes ?? c.votes_count} /> voix en ligne
              {tickPulse && isLeader && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </p>
          )}
        </div>
        <span className={`text-xl font-black tabular-nums ${isLeader ? 'text-emerald-600' : 'text-slate-900'}`}>
          {showSplit ? totalPct : onlinePct}%
        </span>
      </div>

      {/* barre double ou simple */}
      <div className="ml-9 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner flex">
        {showSplit ? (
          <>
            <div
              className="h-full bg-blue-400 transition-all duration-1000 ease-out"
              style={{ width: `${onlinePct}%` }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-1000 ease-out"
              style={{ width: `${physPct}%` }}
            />
          </>
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isLeader ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-slate-300'}`}
            style={{ width: `${onlinePct}%` }}
          />
        )}
      </div>
    </div>
  );
};

// Carte d'un scrutin (affichage des résultats)
const ElectionCard = ({ election, totalInscritsGlobaux, onClose, onPhysicalSaved }) => {
  const { id, title, is_active, total_votes, online_total, physical_total, has_physical, candidates } = election;
  const votersCount = total_votes;
  const participationRate = totalInscritsGlobaux > 0 ? ((votersCount / totalInscritsGlobaux) * 100).toFixed(1) : 0;
  const sortedCandidates = [...candidates].sort((a, b) => b.votes_count - a.votes_count);
  const leader = sortedCandidates[0];
  const [closing, setClosing] = useState(false);
  const [showPhysical, setShowPhysical] = useState(false);
  const [physInputs, setPhysInputs] = useState({});
  const [savingPhys, setSavingPhys] = useState(false);

  // Initialiser les inputs avec les valeurs existantes
  useEffect(() => {
    const init = {};
    candidates.forEach(c => { init[c.id] = c.physical_votes ?? 0; });
    setPhysInputs(init);
  }, [candidates]);

  const handleClose = async () => {
    if (!window.confirm(`Clôturer définitivement le scrutin "${title}" ?`)) return;
    setClosing(true);
    try {
      await api.put(`/positions/${id}`, { is_active: false });
      if (onClose) onClose(id);
    } catch (error) {
      console.error("Erreur lors de la clôture", error);
    } finally {
      setClosing(false);
    }
  };

  const handleSavePhysical = async () => {
    setSavingPhys(true);
    try {
      await api.post(`/positions/${id}/physical-votes`, { votes: physInputs });
      setShowPhysical(false);
      if (onPhysicalSaved) onPhysicalSaved();
    } catch (e) {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSavingPhys(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8">
        {/* En-tête avec titre, statut, leader et bouton clôturer */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {is_active && <LiveDot />}
              <h2 className="text-xl font-[900] text-slate-900">{title}</h2>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {is_active ? 'En cours' : 'Clôturé'}
            </div>
          </div>

          {/* Partie droite : leader + boutons */}
          <div className="flex items-center gap-4 flex-wrap">
            {leader && leader.votes_count > 0 && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 shadow-sm">
                <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-emerald-400 shrink-0">
                  {leader.photo_path ? (
                    <img src={leader.photo_path} className="w-full h-full object-cover" alt={leader.name} />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User size={14} className="text-slate-400" /></div>
                  )}
                </div>
                <div>
                  <p className="text-[8px] font-black text-emerald-600 tracking-widest uppercase leading-none mb-0.5">En tête</p>
                  <p className="text-sm font-black text-slate-800 leading-tight">{leader.name}</p>
                </div>
              </div>
            )}

            {/* Bouton saisie votes physiques — seulement si scrutin clôturé */}
            {!is_active && (
              <button
                onClick={() => setShowPhysical(!showPhysical)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border transition-all ${
                  showPhysical
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <ClipboardList size={15} />
                {has_physical ? 'Modifier votes physiques' : 'Saisir votes physiques'}
              </button>
            )}

            {is_active && (
              <button onClick={handleClose} disabled={closing}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all text-xs font-black"
              >
                <XCircle size={16} /> {closing ? 'Fermeture...' : 'Clôturer'}
              </button>
            )}
          </div>
        </div>

        {/* ── Bandeau état des votes ── */}
        {is_active ? (
          <div className="flex items-center gap-2 mb-5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5">
            <Wifi size={13} className="text-blue-500 shrink-0" />
            <p className="text-[10px] font-black text-blue-600">
              Résultats provisoires — votes en ligne uniquement ({online_total ?? total_votes} voix)
            </p>
            <span className="ml-auto text-[9px] font-black text-blue-400 bg-blue-100 px-2 py-0.5 rounded-lg">Avant jour J</span>
          </div>
        ) : has_physical ? (
          <div className="flex items-center gap-4 mb-5 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
              <p className="text-[10px] font-black text-blue-600">En ligne : {online_total}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <p className="text-[10px] font-black text-amber-600">Physique : {physical_total}</p>
            </div>
            {election.quorum && (
              <div className={`flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-lg border text-[9px] font-black ${
                election.quorum_reached
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-red-50 border-red-100 text-red-500'
              }`}>
                {election.quorum_reached ? '✓' : '✗'} Quorum {election.quorum_reached ? 'atteint' : 'non atteint'} ({election.quorum} requis)
              </div>
            )}
            <span className="ml-auto text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
              Résultats finaux
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5">
            <MapPin size={13} className="text-amber-500 shrink-0" />
            <p className="text-[10px] font-black text-amber-600">
              Scrutin clôturé — votes physiques non encore saisis
            </p>
          </div>
        )}

        {/* ── Formulaire saisie votes physiques ── */}
        {showPhysical && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-5">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4">
              Saisie des votes physiques — délibération du jury
            </p>
            <div className="space-y-3">
              {candidates.map(c => (
                <div key={c.id} className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 border border-amber-100">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {c.photo_path
                      ? <img src={c.photo_path} className="w-full h-full object-cover" alt={c.name} />
                      : <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-slate-300" /></div>
                    }
                  </div>
                  <span className="flex-1 text-sm font-black text-slate-800">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400">{c.online_votes} en ligne</span>
                    <span className="text-slate-200">+</span>
                    <input
                      type="number"
                      min={0}
                      value={physInputs[c.id] ?? 0}
                      onChange={e => setPhysInputs(prev => ({ ...prev, [c.id]: parseInt(e.target.value) || 0 }))}
                      className="w-20 h-9 text-center bg-amber-50 border border-amber-200 rounded-xl font-black text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-[9px] font-black text-amber-600">physique</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPhysical(false)}
                className="px-4 py-2 rounded-2xl text-[11px] font-black text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                Annuler
              </button>
              <button onClick={handleSavePhysical} disabled={savingPhys}
                className="px-5 py-2 rounded-2xl text-[11px] font-black text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100 active:scale-95 transition-all disabled:opacity-60">
                {savingPhys ? 'Enregistrement...' : 'Valider les votes physiques'}
              </button>
            </div>
          </div>
        )}

        {/* Résultats (inchangés) */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-300" />
                <h3 className="text-[11px] font-black text-slate-900">Répartition des voix</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                <Radio size={9} className="text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600"><AnimatedNumber value={votersCount} /> votes</span>
              </div>
            </div>
            <div className="space-y-8">
              {sortedCandidates.map((c, i) => (
                <CandidateRow key={i} c={c} index={i} votersCount={votersCount} tickPulse={false} isActive={is_active} hasPhysical={has_physical} />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-80 bg-slate-50 rounded-3xl p-6 flex flex-col items-center gap-4">
            <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Taux de participation</p>
            <RingProgress value={parseFloat(participationRate)} />
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="text-center p-3 bg-white rounded-2xl border border-slate-100">
                <p className="text-xl font-[900] text-slate-900"><AnimatedNumber value={votersCount} /></p>
                <p className="text-[8px] font-black text-slate-400 uppercase">Votants</p>
              </div>
              <div className="text-center p-3 bg-white rounded-2xl border border-slate-100">
                <p className="text-xl font-[900] text-slate-400"><AnimatedNumber value={totalInscritsGlobaux} /></p>
                <p className="text-[8px] font-black text-slate-400 uppercase">Inscrits</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp size={11} className="text-slate-300" />
              <p className="text-[9px] font-bold text-slate-400">Les votes sont anonymes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Page principale (inchangée) ── */
const AdminresultsPage = () => {
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const [totalInscrits, setTotalInscrits] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAllResults = async () => {
    try {
      const response = await api.get('/votes/results/all');
      if (response.data?.success) {
        setElections(response.data.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Erreur chargement résultats:', error);
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
    fetchAllResults();

    const interval = setInterval(() => {
      if (!document.hidden) fetchAllResults();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseElection = (closedId) => {
    setElections(prev => prev.map(e => e.id === closedId ? { ...e, is_active: false } : e));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/votes/results/pdf', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resultats_scrutins.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF :', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout activePage="results">
        <div className="flex h-[70vh] flex-col items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="mt-4 text-[10px] font-black text-slate-400 animate-pulse uppercase">Chargement des résultats...</p>
        </div>
      </AdminLayout>
    );
  }

  if (elections.length === 0) {
    return (
      <AdminLayout activePage="results">
        <div className="text-center py-20">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aucun scrutin disponible.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="results">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LiveDot />
              <span className="text-[9px] font-black tracking-[0.2em] text-red-500 uppercase">Live</span>
              <span className="text-[9px] text-slate-400 font-medium">
                · mise à jour toutes les 10s
                {lastRefresh && ` · ${lastRefresh.toLocaleTimeString('fr-FR')}`}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">Résultats des scrutins</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-black text-xs"
            >
              <Printer size={18} /> Imprimer
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-2xl shadow-sm hover:bg-emerald-100 transition-all font-black text-xs"
            >
              <FileDown size={18} /> Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 print:space-y-4 print:break-inside-avoid">
        {elections.map(election => (
          <ElectionCard
            key={election.id}
            election={election}
            totalInscritsGlobaux={totalInscrits}
            onClose={handleCloseElection}
            onPhysicalSaved={fetchAllResults}
          />
        ))}
      </div>

      <style>{`
        @media print {
          .sidebar, .no-print, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white;
            margin: 0;
            padding: 20px;
          }
          .rounded-\\[40px\\], .rounded-3xl, .rounded-2xl {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminresultsPage;