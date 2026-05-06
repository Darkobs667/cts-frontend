import React, { useState, useEffect, useRef } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { ShieldCheck, Download, History, RefreshCw, CheckCircle2, Clock, Hash } from 'lucide-react';
import api from '../services/api';

/* ── Animated counter ── */
const AnimatedNumber = ({ value, duration = 700 }) => {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = 0;
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
  return <>{display < 10 ? `0${display}` : display}</>;
};

/* ── Vote card ── */
const VoteCard = ({ v, index, onDownload }) => {
  const [downloading, setDownloading] = useState(false);

  const handleClick = async () => {
    setDownloading(true);
    await onDownload(v.id);
    setTimeout(() => setDownloading(false), 1500);
  };

  const formattedDate = new Date(v.date_voted).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="group bg-white rounded-3xl border border-slate-100 shadow-sm
        hover:shadow-md hover:border-emerald-100 transition-all duration-300
        overflow-hidden fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* top accent on hover */}
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-400 to-teal-400
        transition-all duration-500 rounded-full" />

      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">

        {/* index */}
        <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100
          flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-slate-300">
            {index + 1 < 10 ? `0${index + 1}` : index + 1}
          </span>
        </div>

        {/* election info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
            <span className="text-[9px] font-black text-emerald-600 tracking-widest uppercase">
              Vote enregistré
            </span>
          </div>
          <h3 className="font-[900] text-slate-900 text-sm md:text-base truncate leading-tight">
            {v.election_title}
          </h3>
        </div>

        {/* date */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <Clock size={11} className="text-slate-300" />
          <span className="text-xs font-bold text-slate-400 italic">{formattedDate}</span>
        </div>

        {/* ref */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <Hash size={10} className="text-slate-300" />
          <code className="bg-slate-900 text-[10px] px-3 py-1.5 rounded-xl font-bold
            text-emerald-400 border border-slate-800 tracking-wider">
            {v.transaction_ref}
          </code>
        </div>

        {/* download */}
        <button
          onClick={handleClick}
          disabled={downloading}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black
            border border-slate-100 bg-white text-slate-600 shadow-sm
            hover:bg-emerald-500 hover:text-white hover:border-emerald-500
            active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait
            self-start md:self-auto"
        >
          {downloading
            ? <RefreshCw size={13} className="animate-spin" />
            : <Download size={13} />
          }
          <span className="hidden sm:inline">
            {downloading ? 'Génération…' : 'Obtenir le reçu'}
          </span>
        </button>
      </div>

      {/* mobile: date + ref row */}
      <div className="md:hidden px-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Clock size={10} className="text-slate-300" />
          <span className="text-[10px] font-bold text-slate-400 italic">{formattedDate}</span>
        </div>
        <code className="bg-slate-900 text-[9px] px-2.5 py-1 rounded-lg font-bold
          text-emerald-400 border border-slate-800 tracking-wider">
          {v.transaction_ref}
        </code>
      </div>
    </div>
  );
};

/* ── Main page ── */
const VoterHistory = () => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [votes, setVotes] = useState([]);

  const fetchHistory = async (showSync = false) => {
    try {
      if (showSync) setIsSyncing(true);
      else setLoading(true);
      const response = await api.get('/votes/my');
      setVotes(response.data);
    } catch (error) {
      console.error("Erreur historique :", error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDownloadReceipt = async (voteId) => {
    try {
      const response = await api.get(`/voter/receipt/${voteId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recu_Vote_${voteId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Impossible de générer le reçu pour le moment.", error);
    }
  };

  return (
    <VoterLayout activePage="votes">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }

        @keyframes softGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
          50%       { box-shadow: 0 0 16px 5px rgba(16,185,129,.1); }
        }
        .soft-glow { animation: softGlow 3s ease-in-out infinite; }
      `}</style>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
            <ShieldCheck className="absolute text-emerald-500 animate-pulse" size={20} />
          </div>
          <p className="mt-5 text-[10px] font-[900] text-slate-400 animate-pulse tracking-widest uppercase">
            Vérification de l'intégrité du registre…
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">

          {/* ── header ── */}
          <div className="mb-8 fade-up flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <h1 className="text-xl md:text-2xl font-[900] text-slate-900 flex items-center gap-3">
                Mes Participations
                {isSyncing && <RefreshCw size={15} className="animate-spin text-emerald-500" />}
              </h1>
              <p className="text-slate-400 font-bold mt-1 text-xs">
                Preuves de vote stockées sur la plateforme sécurisée
              </p>
            </div>

            {/* counter chip */}
            <div className="flex items-center gap-4 bg-white px-5 py-4 rounded-3xl
              border border-slate-100 shadow-sm soft-glow self-start md:self-auto">
              <div className="text-right">
                <span className="text-3xl font-[900] text-emerald-500 leading-none tabular-nums">
                  <AnimatedNumber value={votes.length} />
                </span>
                <p className="text-[8px] font-black text-slate-300 mt-1 tracking-widest uppercase">
                  Actions
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                <History size={20} />
              </div>
            </div>
          </div>

          {/* ── list ── */}
          {votes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {votes.map((v, i) => (
                <VoteCard key={v.id} v={v} index={i} onDownload={handleDownloadReceipt} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center
              bg-white rounded-3xl border border-slate-100 shadow-sm fade-up">
              <div className="w-16 h-16 bg-slate-50 rounded-[24px] border-2 border-dashed
                border-slate-200 flex items-center justify-center mb-5">
                <History size={28} className="text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-black text-base">Aucune activité</h3>
              <p className="text-slate-400 font-bold text-[10px] mt-1.5">
                Vous n'avez pas encore participé à un scrutin
              </p>
            </div>
          )}

          {/* ── footer ── */}
          <div className="mt-8 flex items-center gap-2 justify-center">
            <ShieldCheck size={12} className="text-emerald-500" />
            <p className="text-[9px] font-bold text-slate-300">
              Registre audité par Cyber Tech Squad
            </p>
          </div>

        </div>
      )}
    </VoterLayout>
  );
};

export default VoterHistory;