import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { User, ShieldCheck, Fingerprint, Mail, CreditCard, KeyRound } from 'lucide-react';
import { getConnectedUser } from '../utils/userHelper';

const VoterProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = getConnectedUser();
    if (user) {
      setUserData({
        nom: user.fullName,
        email: user.email,
        uid: `CTS-${String(user.id).padStart(5, '0')}`,
        initials: user.initials,
      });
    }
    setLoading(false);
  }, []);

  return (
    <VoterLayout activePage="profile">
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
            <Fingerprint className="absolute text-emerald-500 animate-pulse" size={26} />
          </div>
          <p className="mt-6 text-[10px] font-black text-slate-400 animate-pulse tracking-widest uppercase">
            Chargement du profil…
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 pb-20 max-w-3xl mx-auto">

          {/* header */}
          <div className="mb-10 fade-up">
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">Mon profil électeur</h1>
            <p className="text-slate-400 font-bold mt-1 text-xs">Informations de votre compte</p>
          </div>

          <div className="space-y-5">

            {/* carte identité */}
            <div
              className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-7 md:p-10 fade-up"
              style={{ animationDelay: '60ms' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none select-none">
                <ShieldCheck size={110} />
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-3xl" />

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl border-2 border-slate-100 flex items-center justify-center shadow-sm">
                    <span className="text-3xl font-black text-slate-300">{userData.initials}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg shadow-emerald-100">
                    <ShieldCheck size={16} strokeWidth={3} />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Membre inscrit
                  </span>
                  <h2 className="text-base md:text-lg font-[900] text-slate-900 mb-1">{userData.nom}</h2>
                  <p className="text-[10px] font-bold text-slate-400 font-mono">{userData.uid}</p>
                </div>
              </div>
            </div>

            {/* fiche */}
            <div
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 md:p-8 fade-up"
              style={{ animationDelay: '120ms' }}
            >
              <div className="flex items-center gap-2.5 pb-5 mb-6 border-b border-slate-50">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <User size={14} className="text-slate-400" />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 tracking-wide">Fiche électeur</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-300 tracking-widest uppercase ml-1 mb-2 block">Nom complet</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <CreditCard size={14} className="text-slate-300" />
                    <span className="font-bold text-slate-700 text-sm">{userData.nom}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-300 tracking-widest uppercase ml-1 mb-2 block">Adresse institutionnelle</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Mail size={14} className="text-slate-300" />
                    <span className="font-bold text-slate-700 text-sm">{userData.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-300 tracking-widest uppercase ml-1 mb-2 block">Identifiant électeur</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <KeyRound size={14} className="text-slate-300" />
                    <span className="font-mono font-bold text-emerald-600 text-sm">{userData.uid}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* note sécurité honnête */}
            <div
              className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-3xl p-5 fade-up"
              style={{ animationDelay: '180ms' }}
            >
              <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-700">Sécurité du compte</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 leading-relaxed">
                  Votre compte est protégé par votre adresse email et votre mot de passe. En cas de problème d'accès, contactez un administrateur du club.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </VoterLayout>
  );
};

export default VoterProfile;
