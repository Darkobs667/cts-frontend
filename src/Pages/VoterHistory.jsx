import React, { useState, useEffect, useRef } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { ShieldCheck, Download, History, RefreshCw, CheckCircle2, Clock, Hash, Share2, X, User } from 'lucide-react';
import api from '../services/api';
import { getConnectedUser } from '../utils/userHelper';
import logocts from '../assets/logo-cts2-removebg-preview.png';

/* ── Animated counter ── */
const AnimatedNumber = ({ value, duration = 700 }) => {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const end = Number(value);
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(end * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display < 10 ? `0${display}` : display}</>;
};

/* ── Ticket visuel partageable ── */
const ShareTicketModal = ({ vote, voterName, onClose }) => {
  const ticketRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(vote.date_voted).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleShare = async () => {
    const text = `✅ J'ai voté lors du scrutin CTS !\n\n🗳️ Scrutin : ${vote.election_title}\n👤 Mon choix : ${vote.candidate_name}\n📅 Le : ${formattedDate}\n🔖 Réf : ${vote.transaction_ref}\n\n⚡ Cyber Tech Squad — Vote sécurisé`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mon reçu de vote CTS', text });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="w-full max-w-sm flex flex-col gap-4 animate-in fade-in zoom-in duration-300">

        {/* Ticket */}
        <div ref={ticketRef} className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100">

          {/* Header gradient */}
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-7 py-7 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
            <img src={logocts} alt="CTS" className="h-10 mx-auto mb-3 relative z-10" />
            <p className="text-white font-black text-base relative z-10">J'ai voté !</p>
            <p className="text-emerald-100 text-[10px] font-bold mt-0.5 relative z-10 tracking-widest uppercase">
              Cyber Tech Squad
            </p>
          </div>

          {/* Découpe ticket */}
          <div className="flex items-center -my-0">
            <div className="w-5 h-5 rounded-full bg-slate-50 -ml-2.5 shrink-0 border border-slate-100" />
            <div className="flex-1 border-t-2 border-dashed border-slate-100 mx-1" />
            <div className="w-5 h-5 rounded-full bg-slate-50 -mr-2.5 shrink-0 border border-slate-100" />
          </div>

          {/* Body */}
          <div className="px-7 py-6 flex flex-col gap-4">

            {/* Votant */}
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Électeur</p>
              <p className="text-sm font-black text-slate-900">{voterName}</p>
            </div>

            {/* Scrutin */}
            <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Scrutin</p>
              <p className="text-sm font-black text-slate-900">{vote.election_title}</p>
            </div>

            {/* Candidat */}
            <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 border-emerald-200 bg-white flex items-center justify-center">
                {vote.photo_path
                  ? <img src={vote.photo_path} className="w-full h-full object-cover" alt={vote.candidate_name} />
                  : <User size={16} className="text-emerald-300" />
                }
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Vote pour</p>
                <p className="text-sm font-black text-emerald-700">{vote.candidate_name}</p>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500 ml-auto shrink-0" />
            </div>

            {/* Date + Ref */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400">{formattedDate}</span>
              <code className="bg-slate-900 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-lg tracking-widest">
                {vote.transaction_ref}
              </code>
            </div>
          </div>

          {/* Footer ticket */}
          <div className="bg-slate-50 px-7 py-3 flex items-center justify-center gap-2 border-t border-slate-100">
            <ShieldCheck size={11} className="text-emerald-500" />
            <p className="text-[9px] font-bold text-slate-400">Vote anonymisé et sécurisé — CTS 2026</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white rounded-2xl font-black text-slate-400 text-xs border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <X size={14} /> Fermer
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black text-white text-xs shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {copied
              ? <><CheckCircle2 size={14} /> Copié !</>
              : <><Share2 size={14} /> Partager</>
            }
          </button>
        </div>

        <p className="text-center text-[9px] font-bold text-slate-400">
          📸 Fais une capture d'écran pour partager sur les réseaux
        </p>
      </div>
    </div>
  );
};

/* ── Vote card ── */
const VoteCard = ({ v, index, onDownload, onShare }) => {
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
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 rounded-full" />

      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">

        <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-slate-300">
            {index + 1 < 10 ? `0${index + 1}` : index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
            <span className="text-[9px] font-black text-emerald-600 tracking-widest uppercase">Vote enregistré</span>
          </div>
          <h3 className="font-[900] text-slate-900 text-sm md:text-base truncate leading-tight">{v.election_title}</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Pour : <span className="text-slate-600">{v.candidate_name}</span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <Clock size={11} className="text-slate-300" />
          <span className="text-xs font-bold text-slate-400 italic">{formattedDate}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <Hash size={10} className="text-slate-300" />
          <code className="bg-slate-900 text-[10px] px-3 py-1.5 rounded-xl font-bold text-emerald-400 border border-slate-800 tracking-wider">
            {v.transaction_ref || '—'}
          </code>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onShare(v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black
              border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm
              hover:bg-emerald-500 hover:text-white hover:border-emerald-500
              active:scale-95 transition-all duration-200"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Partager</span>
          </button>

          <button
            onClick={handleClick}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black
              border border-slate-100 bg-white text-slate-600 shadow-sm
              hover:bg-slate-50 active:scale-95 transition-all duration-200
              disabled:opacity-50 disabled:cursor-wait"
          >
            {downloading ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span className="hidden sm:inline">{downloading ? 'Génération…' : 'PDF'}</span>
          </button>
        </div>
      </div>

      <div className="md:hidden px-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Clock size={10} className="text-slate-300" />
          <span className="text-[10px] font-bold text-slate-400 italic">{formattedDate}</span>
        </div>
        <code className="bg-slate-900 text-[9px] px-2.5 py-1 rounded-lg font-bold text-emerald-400 border border-slate-800 tracking-wider">
          {v.transaction_ref || '—'}
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
  const [shareVote, setShareVote] = useState(null);
  const user = getConnectedUser();

  const fetchHistory = async (showSync = false) => {
    try {
      if (showSync) setIsSyncing(true);
      else setLoading(true);
      const response = await api.get('/votes/my');
      const data = response.data;
      setVotes(Array.isArray(data) ? data : []);
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
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Impossible de générer le reçu pour le moment.');
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

      {shareVote && (
        <ShareTicketModal
          vote={shareVote}
          voterName={user?.fullName || 'Électeur'}
          onClose={() => setShareVote(null)}
        />
      )}

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

            <div className="flex items-center gap-4 bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm soft-glow self-start md:self-auto">
              <div className="text-right">
                <span className="text-3xl font-[900] text-emerald-500 leading-none tabular-nums">
                  <AnimatedNumber value={votes.length} />
                </span>
                <p className="text-[8px] font-black text-slate-300 mt-1 tracking-widest uppercase">Votes</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                <History size={20} />
              </div>
            </div>

            <button
              onClick={() => fetchHistory(true)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-100 bg-white text-slate-400 font-black text-[10px] hover:bg-slate-50 transition-all disabled:opacity-50 self-start md:self-auto"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>

          {votes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {votes.map((v, i) => (
                <VoteCard
                  key={v.id}
                  v={v}
                  index={i}
                  onDownload={handleDownloadReceipt}
                  onShare={(vote) => setShareVote(vote)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-3xl border border-slate-100 shadow-sm fade-up">
              <div className="w-16 h-16 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-5">
                <History size={28} className="text-slate-200" />
              </div>
              <h3 className="text-slate-900 font-black text-base">Aucune activité</h3>
              <p className="text-slate-400 font-bold text-[10px] mt-1.5">
                Vous n'avez pas encore participé à un scrutin
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-2 justify-center">
            <ShieldCheck size={12} className="text-emerald-500" />
            <p className="text-[9px] font-bold text-slate-300">Registre audité par Cyber Tech Squad</p>
          </div>

        </div>
      )}
    </VoterLayout>
  );
};

export default VoterHistory;
