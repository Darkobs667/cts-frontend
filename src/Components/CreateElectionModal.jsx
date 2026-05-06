import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Save } from 'lucide-react';
import adminService from '../services/adminService';

const CreateElectionModal = ({ close, initialData = null }) => {
  const isEditing = !!initialData;
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitre(initialData.title || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!titre.trim()) return alert("Le titre du poste est obligatoire.");

  const payload = {
    title: titre,
    description: description || "Scrutin officiel",
    is_active: true,
  };

  try {
    setLoading(true);
    let response;
    if (isEditing) {
      response = await adminService.updatePosition(initialData.id, payload);
    } else {
      response = await adminService.createPosition(payload);
    }

    // ✔️ Succès : soit la réponse contient un id, soit un message, soit un success:true
    const data = response.data;
    if (data && (data.id || data.success || data.message)) {
      alert(isEditing ? "Scrutin modifié avec succès !" : "Scrutin créé avec succès !");
      close();
    } else {
      // Cas peu probable où la réponse est bizarre
      alert("Réponse inattendue du serveur.");
    }
  } catch (error) {
    console.error("Erreur :", error.response?.data || error.message);
    const serverMessage = error.response?.data?.errors?.title?.[0];
    if (serverMessage) alert(`Erreur : ${serverMessage}`);
    else alert("Erreur lors de l'enregistrement. Vérifie la console.");
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
            <X size={24}/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
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
          {isEditing && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_active" defaultChecked={initialData.is_active === 1}
                onChange={(e) => { /* facultatif, on peut envoyer is_active true/false */ }}
                className="rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400" />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-600">Scrutin actif</label>
            </div>
          )}
        </form>
        <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
          <button type="button" onClick={close} className="flex-1 py-4 font-black text-slate-400 text-[10px] hover:text-slate-600 transition-colors">Annuler</button>
          <button type="submit" onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-emerald-500 py-5 rounded-[24px] text-white font-[900] text-[11px] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Enregistrement...' : (isEditing ? <Save size={20} /> : <CheckCircle2 size={20} />)}
            {isEditing ? 'Modifier le scrutin' : 'Enregistrer le poste'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateElectionModal;