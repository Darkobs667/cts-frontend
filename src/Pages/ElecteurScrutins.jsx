import React, { useState, useEffect } from 'react';
import VoterLayout from "../Components/VoterLayout";
import { ChevronDown, ChevronUp, Loader2, User, Vote, FilePlus, X, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ElecteurScrutins = () => {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [candidatesByPos, setCandidatesByPos] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyPosition, setApplyPosition] = useState(null);
  const [form, setForm] = useState({ bio: '', slogan: '', photo: null, preview: null });
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState({});

  const fetchPositions = async () => {
    try {
      const response = await api.get('/positions');
      if (response.data?.success) {
        const all = [...(response.data.data || []), ...(response.data.failed || [])];
        setPositions(all);
      }
    } catch (error) {
      console.error("Erreur chargement des postes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPositions(); }, []);

  const toggleCandidates = async (positionId) => {
    if (expandedId === positionId) { setExpandedId(null); return; }
    setExpandedId(positionId);
    if (!candidatesByPos[positionId]) {
      setLoadingCandidates(prev => ({ ...prev, [positionId]: true }));
      try {
        const res = await api.get('/candidates', { params: { position_id: positionId } });
        const data = (res.data.data || []).filter(c => c.status === 'valide');
        const formatted = data.map(c => ({
          id: c.id,
          nom: c.user ? `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() : `Utilisateur #${c.user_id}`,
          role: c.user?.role || 'electeur',
          slogan: c.slogan || c.bio || 'Pas de profession de foi',
          photo: c.photo_path ? `${import.meta.env.VITE_STORAGE_URL}/${c.photo_path}` : null,
        }));
        setCandidatesByPos(prev => ({ ...prev, [positionId]: formatted }));
      } catch (error) {
        console.error("Erreur chargement candidats", error);
      } finally {
        setLoadingCandidates(prev => ({ ...prev, [positionId]: false }));
      }
    }
  };

  const openApplyModal = (position) => {
    setApplyPosition(position);
    setForm({ bio: '', slogan: '', photo: null, preview: null });
    setShowApplyModal(true);
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, photo: file, preview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyPosition) return;
    const payload = new FormData();
    payload.append('position_id', applyPosition.id);
    payload.append('bio', form.bio || '');
    payload.append('slogan', form.slogan || '');
    if (form.photo) payload.append('photo', form.photo);
    try {
      setSubmitting(true);
      const res = await api.post('/apply', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setApplicationStatus(prev => ({ ...prev, [applyPosition.id]: 'submitted' }));
      setShowApplyModal(false);
      alert(res.data.message || 'Candidature envoyée avec succès');
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de l'envoi";
      alert(message);
      if (error.response?.status === 409) {
        setApplicationStatus(prev => ({ ...prev, [applyPosition.id]: 'exists' }));
        setShowApplyModal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VoterLayout activePage="scrutins">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .42s ease both; }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-in { animation: modalIn .3s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div className="max-w-3xl mx-auto pb-20">

        {/* ── header ── */}
        <div className="mb-8 fade-up">
          <h1 className="text-xl md:text-2xl font-[900] text-slate-900">Tous les scrutins</h1>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Consultez les postes et leurs candidats, et postulez si vous le souhaitez
          </p>
        </div>

        {/* ── loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
              <Vote className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase animate-pulse">
              Chargement des scrutins…
            </p>
          </div>

        ) : positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm fade-up">
            <div className="w-16 h-16 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
              <Vote size={24} className="text-slate-200" />
            </div>
            <p className="font-black text-slate-400 text-sm">Aucun scrutin trouvé.</p>
          </div>

        ) : (
          <div className="flex flex-col gap-3">
            {positions.map((pos, i) => {
              const isActive = pos.is_active == 1;
              const isExpanded = expandedId === pos.id;
              const appStatus = applicationStatus[pos.id];

              return (
                <div
                  key={pos.id}
                  className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden
                    transition-all duration-300 fade-up
                    ${isExpanded ? 'border-emerald-100 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* ── row header ── */}
                  <div className="p-5 md:p-6 flex items-center gap-4">

                    {/* icon */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      <Vote size={17} />
                    </div>

                    {/* title + desc — clickable */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleCandidates(pos.id)}
                    >
                      <h3 className="font-[900] text-slate-900 text-sm md:text-base leading-tight truncate">
                        {pos.title}
                      </h3>
                      {pos.description && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                          {pos.description}
                        </p>
                      )}
                    </div>

                    {/* right controls */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">

                      {/* status badge */}
                      {isActive ? (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl
                          text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                          En cours
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl
                          text-[9px] font-black bg-slate-50 text-slate-400 border border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Inactif
                        </span>
                      )}

                      {/* apply / status */}
                      {appStatus === 'submitted' ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                          <CheckCircle2 size={13} /> <span className="hidden sm:inline">Candidature envoyée</span>
                        </span>
                      ) : appStatus === 'exists' ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                          <AlertCircle size={13} /> <span className="hidden sm:inline">Déjà postulé</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); openApplyModal(pos); }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-black
                            bg-white border border-slate-100 text-slate-600 shadow-sm
                            hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100
                            active:scale-95 transition-all duration-200"
                        >
                          <FilePlus size={14} />
                          <span className="hidden sm:inline">Postuler</span>
                        </button>
                      )}

                      {/* expand toggle */}
                      <button
                        onClick={() => toggleCandidates(pos.id)}
                        className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center
                          text-slate-400 hover:bg-slate-100 transition-colors"
                      >
                        {isExpanded
                          ? <ChevronUp size={16} />
                          : <ChevronDown size={16} />
                        }
                      </button>
                    </div>
                  </div>

                  {/* ── candidates panel ── */}
                  {isExpanded && (
                    <div className="border-t border-slate-50 bg-slate-50/40 p-5 md:p-6">
                      {loadingCandidates[pos.id] ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                        </div>

                      ) : candidatesByPos[pos.id]?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-12 h-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
                            <User size={18} className="text-slate-200" />
                          </div>
                          <p className="text-[11px] font-black text-slate-400">
                            Aucun candidat officiel pour ce poste.
                          </p>
                        </div>

                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {candidatesByPos[pos.id]?.map((cand) => (
                            <div
                              key={cand.id}
                              className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                            >
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                {cand.photo ? (
                                  <img src={cand.photo} alt={cand.nom} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User size={18} className="text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-[900] text-sm text-slate-800 leading-tight truncate">{cand.nom}</p>
                                <p className="text-[10px] text-slate-400  mt-0.5 truncate">{cand.slogan}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── apply modal ── */}
      {showApplyModal && applyPosition && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
          p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-3xl shadow-2xl
            modal-in flex flex-col max-h-[92vh] sm:max-h-[85vh]">

            {/* modal header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-[900] text-slate-900">
                  Postuler — <span className="text-emerald-600">{applyPosition.title}</span>
                </h3>
                <p className="text-[9px] font-black text-slate-400 mt-0.5 tracking-wide">
                  Remplissez votre profession de foi
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-50
                  border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400
                  transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* modal body */}
            <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5 flex-1">

              {/* slogan */}
              <div>
                <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-2 ml-0.5">
                  Slogan de campagne *
                </label>
                <input
                  required
                  value={form.slogan}
                  onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5
                    font-medium text-sm text-slate-700 placeholder:text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white
                    transition-all"
                  placeholder="Votre slogan phare…"
                />
              </div>

              {/* bio */}
              <div>
                <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-2 ml-0.5">
                  Bio / Présentation
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5
                    font-medium text-sm text-slate-700 placeholder:text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white
                    transition-all resize-none"
                  placeholder="Présentez-vous en quelques mots…"
                />
              </div>

              {/* photo */}
              <div>
                <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-2 ml-0.5">
                  Photo (optionnelle)
                </label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => document.getElementById('apply-photo').click()}
                    className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-slate-50 border-2 border-dashed
                      border-slate-200 flex flex-col items-center justify-center cursor-pointer
                      overflow-hidden hover:border-emerald-400 hover:bg-emerald-50/30
                      transition-all shrink-0"
                  >
                    {form.preview ? (
                      <img src={form.preview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Camera size={20} className="text-slate-300 mb-1" />
                        <span className="text-[8px] font-black text-slate-300 uppercase">Ajouter</span>
                      </>
                    )}
                  </div>
                  <input
                    id="apply-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  {form.preview && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photo: null, preview: null })}
                      className="text-[11px] font-black text-red-400 hover:text-red-500 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* modal footer */}
            <div className="px-6 py-5 border-t border-slate-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3.5 rounded-2xl text-[11px] font-black text-slate-400
                  bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all active:scale-[0.98]"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={submitting || !form.slogan}
                className="flex-[2] py-3.5 rounded-2xl text-sm font-[900] text-white
                  bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100
                  flex items-center justify-center gap-2
                  active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi…</>
                  : 'Envoyer ma candidature'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </VoterLayout>
  );
};

export default ElecteurScrutins;