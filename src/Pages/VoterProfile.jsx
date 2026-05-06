import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { User, ShieldCheck, Fingerprint, Lock, Mail, CreditCard, RefreshCw } from 'lucide-react';
import { getConnectedUser } from '../utils/userHelper';
import api from '../services/api';

const VoterProfile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const user = getConnectedUser();
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUserData({
          nom: user.fullName,
          email: user.email,
          uid: user.created_at,
          isVerified: true,
          twoFactorEnabled: true,
          initials: user.initials,
        });
      } catch (error) {
        console.error("Erreur de chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const toggle2FA = async () => {
    try {
      setUpdating(true);
      const newStatus = !userData.twoFactorEnabled;
      setUserData({ ...userData, twoFactorEnabled: newStatus });
    } catch (error) {
      alert("Erreur lors de la mise à jour de la sécurité.", error);
    } finally {
      setUpdating(false);
    }
  };

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
            Accès au coffre-fort numérique…
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 pb-20">

          {/* ── header ── */}
          <div className="mb-10 fade-up">
            <h1 className="text-xl md:text-2xl font-[900] text-slate-900">
              Mon identité électeur
            </h1>
            <p className="text-slate-400 font-bold mt-1 text-xs">Données biométriques</p>
          </div>

          <div className="space-y-5">

            {/* ── identity card ── */}
            <div
              className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-7 md:p-10 fade-up"
              style={{ animationDelay: '60ms' }}
            >
              {/* watermark */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none select-none">
                <ShieldCheck size={110} />
              </div>

              {/* top accent stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-3xl" />

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">

                {/* avatar */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl border-2 border-slate-100 flex items-center justify-center shadow-sm">
                    {userData.photo ? (
                      <img src={userData.photo} className="w-full h-full object-cover rounded-3xl" alt="Profil" />
                    ) : (
                      <span className="text-3xl font-black text-slate-300">{userData.initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg shadow-emerald-100">
                    <ShieldCheck size={16} strokeWidth={3} />
                  </div>
                </div>

                {/* info */}
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      Membre certifié
                    </span>
                  </div>

                  <h2 className="text-base md:text-lg font-[900] text-slate-900 mb-1">
                    {userData.nom}
                  </h2>

                  <p className="text-[10px] font-bold text-slate-400 font-mono mb-3">
                    {userData.uid}
                  </p>

                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-[9px] font-black border ${
                    userData.isVerified
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-500 border-amber-100'
                  }`}>
                    <ShieldCheck size={10} />
                    {userData.isVerified ? 'Vérification complète' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── info grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* fiche électeur */}
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
                  {/* nom */}
                  <div>
                    <label className="text-[9px] font-black text-slate-300 tracking-widest uppercase ml-1 mb-2 block">
                      Nom complet
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100
                      hover:bg-white hover:border-emerald-100 transition-all duration-200 group">
                      <CreditCard size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                      <span className="font-bold text-slate-700 text-sm">{userData.nom}</span>
                    </div>
                  </div>

                  {/* email */}
                  <div>
                    <label className="text-[9px] font-black text-slate-300 tracking-widest uppercase ml-1 mb-2 block">
                      Adresse institutionnelle
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100
                      hover:bg-white hover:border-emerald-100 transition-all duration-200 group">
                      <Mail size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                      <span className="font-bold text-slate-700 text-sm">{userData.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* sécurité */}
              <div
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 md:p-8 flex flex-col justify-between fade-up"
                style={{ animationDelay: '180ms' }}
              >
                <div>
                  <div className="flex items-center gap-2.5 pb-5 mb-6 border-b border-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Lock size={14} className="text-slate-400" />
                    </div>
                    <h3 className="text-[11px] font-black text-slate-900 tracking-wide">Centre de sécurité</h3>
                  </div>

                  {/* 2FA toggle */}
                  <div
                    onClick={!updating ? toggle2FA : undefined}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
                      userData.twoFactorEnabled
                        ? 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50'
                        : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                          userData.twoFactorEnabled ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">Double authentification</p>
                          <p className={`text-[9px] font-bold mt-0.5 tracking-widest ${
                            userData.twoFactorEnabled ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {userData.twoFactorEnabled ? 'PROTÉGÉ PAR 2FA' : 'NON SÉCURISÉ'}
                          </p>
                        </div>
                      </div>

                      {/* toggle pill */}
                      <div className={`w-12 h-6 rounded-full relative p-0.5 transition-colors duration-500 shrink-0 ${
                        userData.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}>
                        {updating ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw size={12} className="animate-spin text-white" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ${
                            userData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* reset button */}
                <button className="w-full mt-5 py-4 border-2 border-dashed border-slate-100 rounded-2xl
                  text-[10px] font-black text-slate-400
                  hover:bg-slate-900 hover:text-white hover:border-slate-900
                  transition-all duration-200 flex items-center justify-center gap-2 group">
                  <Lock size={13} className="group-hover:rotate-12 transition-transform duration-300" />
                  Réinitialiser les accès
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </VoterLayout>
  );
};

export default VoterProfile;