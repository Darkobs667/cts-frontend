import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Save, Loader2 } from 'lucide-react';
import adminService from '../services/adminService';

const CreateElectionModal = ({ close, initialData = null }) => {
  const isEditing = !!initialData;
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [quorum, setQuorum] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitre(initialData.title || '');
      setDescription(initialData.description || '');
      setClosesAt(initialData.closes_at ? initialData.closes_at.slice(0, 16) : '');
      setQuorum(initialData.quorum || '');
      setIsActive(initialData.is_active === 1 || initialData.is_active === true);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titre.trim()) { setError("Le titre du poste est obligatoire."); return; }

    const payload = {
      title: titre,
      description: description || 'Scrutin officiel',
      is_active: isEditing ? isActive : true,
      closes_at: closesAt || null,
      quorum: quorum ? parseInt(quorum) : null,
    };

    try {
      setLoading(true);
      setError('');
      if (isEditing) {
        await adminService.updatePosition(initialData.id, payload);
      } else {
        await adminService.createPosition(payload);
      }
      close();
    } catch (err) {
      const msg = err.response?.data?.errors?.title?.[0]
        || err.response?.data?.message
        || "Erreur lors de l'enregistrement.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">

        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-[900] text-slate-900">
              {isEditing ? 'Modifier le scrutin' : 'Créer un poste / scrutin'}
            </h3>
            <p className="text-[10px] text-emerald-500 font-black">
              {isEditing ? 'Modifiez les informations du scrutin' : 'Définissez le titre et la description'}
            </p>
          </div>
          <button onClick={close} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-300 hover:text-red-500 shadow-sm">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Intitulé du poste / scrutin</label>
            <input required value={titre} onChange={(e) => setTitre(e.target.value)}
              className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-300"
              placeholder="ex: Président du Bureau des Étudiants" />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Description (optionnelle)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-300 resize-none"
              placeholder="Décrivez rapidement l'enjeu de ce scrutin..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Clôture automatique (optionnelle)</label>
              <input type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)}
                className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all" />
              <p className="text-[9px] text-slate-400 font-medium mt-1 ml-2">Le scrutin se fermera automatiquement à cette date</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Quorum minimum (optionnel)</label>
              <input type="number" min={1} value={quorum} onChange={(e) => setQuorum(e.target.value)} placeholder="ex: 20"
                className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all" />
              <p className="text-[9px] text-slate-400 font-medium mt-1 ml-2">Nombre minimum de votants pour valider les résultats</p>
            </div>
          </div>

          {isEditing && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400 w-4 h-4" />
              <span className="text-sm font-bold text-slate-600">Scrutin actif</span>
            </label>
          )}
        </form>

        <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
          <button type="button" onClick={close} className="flex-1 py-4 font-black text-slate-400 text-[10px] hover:text-slate-600 transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-emerald-500 py-5 rounded-[24px] text-white font-[900] text-[11px] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-70">
            {loading ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Save size={18} /> : <CheckCircle2 size={18} />}
            {loading ? 'Enregistrement...' : isEditing ? 'Modifier le scrutin' : 'Enregistrer le poste'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateElectionModal;
