import React, { useState } from 'react';
import { X, UserPlus, Mail, Fingerprint, CheckCircle2 } from 'lucide-react';

const AddElectorModal = ({ close, onAdd }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    identifiant: `CTS-2026-${Math.floor(Math.random() * 900) + 100}`, // Génération auto d'un ID par défaut
    status: 'Validé'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, id: Date.now() });
    close();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center
     p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 ">Inscrire un Électeur</h3>
            <p className="text-[10px] text-emerald-500 font-bold ">Ajout manuel au registre</p>
          </div>
          <button onClick={close} className="p-2 hover:bg-white rounded-full transition-colors
           text-slate-300 hover:text-red-500">
            <X size={24}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Champ Nom */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-2">Nom Complet</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4
                 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 transition-all" 
                placeholder="ex: Moussa Traoré"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
              />
            </div>
          </div>

          {/* Champ Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400  ml-2">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                type="email"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12
                 pr-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 transition-all" 
                placeholder="m.traore@uadb.edu.sn"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Champ Identifiant (Lecture seule ou modifiable) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400  ml-2">Identifiant Unique (ID)</label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4
                 font-mono font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-400 transition-all" 
                value={formData.identifiant}
                onChange={(e) => setFormData({...formData, identifiant: e.target.value})}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={close} 
              className="flex-1 py-4 font-bold text-slate-400  text-[10px]  hover:text-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 bg-emerald-500 py-4 rounded-2xl text-white font-black  text-[10px] 
               shadow-lg shadow-emerald-100 flex items-center justify-center gap-2
                hover:bg-emerald-600 transition-all active:scale-95"
            >
              <CheckCircle2 size={18} /> Valider l'accès
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddElectorModal;