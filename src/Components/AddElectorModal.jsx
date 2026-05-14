import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';

const AddElectorModal = ({ close, onAdd }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/register', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password,
        browserId: `admin-${Date.now()}`,
      });
      onAdd({ nom: `${formData.first_name} ${formData.last_name}`, email: formData.email });
      close();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors || "Erreur lors de l'ajout.";
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">

        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900">Inscrire un Électeur</h3>
            <p className="text-[10px] text-emerald-500 font-bold">Ajout manuel au registre</p>
          </div>
          <button onClick={close} className="p-2 hover:bg-white rounded-full transition-colors text-slate-300 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-2">Prénom</label>
              <input
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 transition-all"
                placeholder="Moussa"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-2">Nom</label>
              <input
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 transition-all"
                placeholder="Traoré"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="email"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 transition-all"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2">Mot de passe temporaire</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                minLength={8}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 transition-all"
                placeholder="Min. 8 caractères"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 flex gap-4">
            <button type="button" onClick={close} className="flex-1 py-4 font-bold text-slate-400 text-[10px] hover:text-slate-600 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 py-4 rounded-2xl text-white font-black text-[10px] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {loading ? 'Enregistrement…' : "Valider l'accès"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddElectorModal;
