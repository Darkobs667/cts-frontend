import React, { useState, useEffect, useRef } from 'react';
import VoterLayout from "../Components/VoterLayout";
import Toast from '../Components/Toast';
import { useLocation, useNavigate } from "react-router";
import { ShieldCheck, ArrowLeft, Send, CheckCircle, User, Lock, Share2, Copy, Check } from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { getConnectedUser } from '../utils/userHelper';
import logocts from '../assets/logo-cts2-removebg-preview.png';

/* ── Lance les confettis ── */
const fireConfetti = () => {
  const count = 180;
  const defaults = { origin: { y: 0.6 }, zIndex: 9999 };
  const fire = (particleRatio, opts) =>
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });

  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#00d991', '#00c282', '#ffffff'] });
  fire(0.2,  { spread: 60, colors: ['#00d991', '#10b981', '#34d399'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#ffffff', '#00d991'] });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1,  { spread: 120, startVelocity: 45 });
};

/* ── Carte de vote partageable ── */
const VoteCard = ({ voteRef, electionTitle, candidateName, voterName, date }) => (
  <div className="relative bg-slate-900 rounded-3xl overflow-hidden p-7 text-white">
    {/* fond décoratif */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/10" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-500/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </div>

    <div className="relative z-10 space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logocts} alt="CTS" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Cyber Tech Squad</p>
            <p className="text-[10px] font-black text-emerald-400">Plateforme de vote</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-black text-emerald-400">VOTE ENREGISTRÉ</span>
        </div>
      </div>

      {/* big check */}
      <div className="flex flex-col items-center py-4 gap-3">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 rotate-3">
          <CheckCircle size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">J'ai voté !</h2>
          <p className="text-emerald-400 text-[10px] font-black tracking-widest uppercase mt-1">
            Ma voix compte
          </p>
        </div>
      </div>

      {/* infos */}
      <div className="space-y-2.5">
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase mb-1">Scrutin</p>
          <p className="text-sm font-black text-white leading-tight">{electionTitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase mb-1">Électeur</p>
            <p className="text-xs font-black text-white truncate">{voterName}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase mb-1">Date</p>
            <p className="text-xs font-black text-white">{date}</p>
          </div>
        </div>
      </div>

      {/* ref */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[8px] font-black text-emerald-500/70 tracking-widest uppercase mb-1">Référence</p>
          <code className="text-emerald-400 font-black text-sm tracking-wider">{voteRef}</code>
        </div>
        <ShieldCheck size={20} className="text-emerald-500/50 shrink-0" />
      </div>

      {/* footer */}
      <p className="text-center text-[8px] font-bold text-slate-600">
        cts-frontend.vercel.app · Vote sécurisé & anonymisé
      </p>
    </div>
  </div>
);

const VoterRecap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voteRef, setVoteRef] = useState('');
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const confettiFired = useRef(false);

  const { election, selectedCandidate } = location.state || {};
  const user = getConnectedUser();

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (isSubmitted && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(fireConfetti, 200);
      setTimeout(fireConfetti, 900);
    }
  }, [isSubmitted]);

  if (!election || !selectedCandidate) {
    return (
      <VoterLayout activePage="dashboard">
        <div className="text-center py-20">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
            Aucune donnée de vote trouvée.
          </p>
          <button onClick={() => navigate('/voterDashboard')}
            className="mt-4 text-emerald-500 font-bold text-sm hover:text-emerald-600 transition-colors">
            Retour au tableau de bord
          </button>
        </div>
      </VoterLayout>
    );
  }

  const handleFinalConfirm = async () => {
    setLoading(true);
    try {
      const position_id = election.id;
      const candidate_id = selectedCandidate.id === 'blanc' ? null : selectedCandidate.id;
      const res = await api.post('/votes', { position_id, candidate_id });
      const id = res.data?.data?.id;
      if (!id) throw new Error("Référence de vote introuvable.");
      setVoteRef('CTS-' + id.toString(36).toUpperCase().padStart(8, '0'));
      setIsSubmitted(true);
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de l'enregistrement du vote.";
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const text = `✅ J'ai voté pour "${election.titre}" sur la plateforme CTS Vote !\n🔐 Référence : ${voteRef}\n\n👉 cts-frontend.vercel.app`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'J\'ai voté — CTS Vote', text });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isBlanc = selectedCandidate.id === 'blanc';

  return (
    <VoterLayout activePage="dashboard">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }

        @keyframes zoomIn {
          from { opacity: 0; transform: scale(.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        .zoom-in { animation: zoomIn .5s cubic-bezier(.34,1.56,.64,1) both; }

        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.6); opacity: 0;  }
        }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: inherit;
          background: #00d991;
          animation: pulse-ring 1.4s ease-out infinite;
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-xl mx-auto pb-20">

        {/* ── PRE-SUBMIT ── */}
        {!isSubmitted ? (
          <>
            <div className="mb-8 fade-up">
              <h1 className="text-xl md:text-2xl font-[900] text-slate-900 mb-2">
                Récapitulatif de votre choix
              </h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-[10px] font-black text-slate-400">
                  Vérification finale avant signature numérique
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 md:p-8 space-y-6 mb-5 fade-up"
              style={{ animationDelay: '60ms' }}>

              <div className="flex items-center gap-2 pb-5 border-b border-slate-50">
                <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <ShieldCheck size={13} className="text-slate-400" />
                </div>
                <p className="text-[11px] font-black text-slate-900 tracking-wide">
                  Scrutin : <span className="text-emerald-600">{election.titre}</span>
                </p>
              </div>

              <div className={`flex items-center gap-5 p-5 rounded-2xl border-2 ${
                isBlanc ? 'bg-slate-900 border-slate-800' : 'bg-emerald-50/60 border-emerald-100'
              }`}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                  {selectedCandidate.photo ? (
                    <img src={selectedCandidate.photo} className="w-full h-full object-cover" alt="Candidat" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isBlanc ? 'bg-slate-800' : 'bg-emerald-100'}`}>
                      <User size={22} className={isBlanc ? 'text-slate-500' : 'text-emerald-300'} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[9px] font-black tracking-widest uppercase mb-1 ${isBlanc ? 'text-slate-500' : 'text-emerald-500'}`}>
                    Candidat sélectionné
                  </p>
                  <h3 className={`font-[900] text-base leading-tight ${isBlanc ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCandidate.nom || selectedCandidate.name}
                  </h3>
                </div>
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${isBlanc ? 'bg-white/10' : 'bg-emerald-500'}`}>
                  <CheckCircle size={16} className="text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-4">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={13} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                    En cliquant sur confirmer, votre bulletin sera chiffré et envoyé au serveur.
                  </p>
                  <p className="text-[10px] font-black text-amber-600 mt-1">Cette action est irréversible.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 fade-up" style={{ animationDelay: '120ms' }}>
              <button disabled={loading} onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-500 rounded-2xl font-[900] text-[11px] hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50">
                <ArrowLeft size={15} /> Modifier le choix
              </button>
              <button disabled={loading} onClick={handleFinalConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-[900] text-sm shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-60">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Chiffrement en cours…
                  </>
                ) : (
                  <>Confirmer le vote <Send size={15} /></>
                )}
              </button>
            </div>
          </>

        ) : (
          /* ── SUCCESS SCREEN ── */
          <div className="zoom-in space-y-4">

            {/* carte partageable */}
            <VoteCard
              voteRef={voteRef}
              electionTitle={election.titre}
              candidateName={isBlanc ? 'Vote blanc' : (selectedCandidate.nom || selectedCandidate.name)}
              voterName={user?.fullName || 'Électeur'}
              date={today}
            />

            {/* bouton partager */}
            <button onClick={handleShare}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-[900] text-sm transition-all active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100">
              {copied ? (
                <><Check size={18} /> Copié dans le presse-papier !</>
              ) : (
                <><Share2 size={18} /> Partager ma participation</>
              )}
            </button>

            {/* retour dashboard */}
            <button onClick={() => navigate('/voterDashboard')}
              className="w-full py-4 bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-2xl font-[900] text-sm transition-all active:scale-[0.98]">
              Retour au tableau de bord
            </button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <ShieldCheck size={11} className="text-emerald-500" />
              <p className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">
                Vote anonymisé · Registre audité · CTS
              </p>
            </div>
          </div>
        )}
      </div>
    </VoterLayout>
  );
};

export default VoterRecap;
