import React, { useState, useEffect } from 'react';
import AdminLayout from '../Components/AdminLayout';
import {
  Plus,
  Trash2,
  Edit3,
  Camera,
  Loader2,
  X,
  CheckCircle2,
  Save,
  Quote,
} from 'lucide-react';
import candidateService from '../services/candidateService';
import api from '../services/api'; // on garde api uniquement pour récupérer users et positions

const Candidats = () => {
  const [candidats, setCandidats] = useState([]);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour la modale
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [form, setForm] = useState({
    user_id: '',
    position_id: '',
    slogan: '',
    bio: '',
    photo: null,
    preview: null,
  });
  const [saving, setSaving] = useState(false);

  const fetchCandidats = async () => {
    try {
      const data = await candidateService.getAll();
      setCandidats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement candidats', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await api.get('/positions');
      if (res.data && res.data.success) {
        setPositions(res.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement postes', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchCandidats(), fetchUsers(), fetchPositions()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: file, preview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({
      user_id: '',
      position_id: '',
      slogan: '',
      bio: '',
      photo: null,
      preview: null,
    });
    setEditingCandidate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (candidate) => {
  setEditingCandidate(candidate);
  setForm({
    user_id: candidate.user_id || candidate.user?.id || '',
    position_id: candidate.position_id || candidate.position?.id || '',
    slogan: candidate.slogan || '',
    bio: candidate.bio || '',
    photo: null,
    preview: candidate.photo_path
      ? `${import.meta.env.VITE_STORAGE_URL}/${candidate.photo_path}`
      : candidate.user?.photo
      ? `${import.meta.env.VITE_STORAGE_URL}/${candidate.user.photo}`
      : null,
  });
  setShowModal(true);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.position_id) {
      return alert('Veuillez sélectionner un électeur et un poste.');
    }

    const payload = new FormData();
    payload.append('user_id', form.user_id);
    payload.append('position_id', form.position_id);
    payload.append('slogan', form.slogan || '');
    payload.append('bio', form.bio || '');
    if (form.photo) {
      payload.append('photo', form.photo);
    }

    try {
      setSaving(true);
      if (editingCandidate) {
        await candidateService.update(editingCandidate.id, payload);
      } else {
        await candidateService.create(payload);
      }
      alert(editingCandidate ? 'Candidat modifié avec succès' : 'Candidat ajouté avec succès');
      setShowModal(false);
      resetForm();
      fetchCandidats();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce candidat ?')) {
      try {
        await candidateService.delete(id);
        setCandidats((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        alert('Erreur lors de la suppression',error);
      }
    }
  };


  return (
    <AdminLayout activePage="candidats">
      {/* Modale d'ajout / modification */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-[900] text-slate-900">
                  {editingCandidate ? 'Modifier le candidat' : 'Ajouter un candidat'}
                </h3>
                <p className="text-[10px] text-emerald-500 font-black">
                  Rattachez un électeur à un poste et personnalisez sa fiche
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-white rounded-2xl transition-all text-slate-300 hover:text-red-500 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
              {/* Sélection utilisateur */}
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Électeur</label>
                <select
                  required
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner"
                >
                  <option value="">-- Choisir un électeur --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nom} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection poste */}
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Poste (scrutin)</label>
                <select
                  required
                  value={form.position_id}
                  onChange={(e) => setForm({ ...form, position_id: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner"
                >
                  <option value="">-- Choisir un poste --</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title} ({pos.is_active == 1 ? 'Actif' : 'Inactif'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slogan */}
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block flex items-center gap-1">
                  <Quote size={10} className="text-emerald-500" /> Slogan de campagne
                </label>
                <input
                  value={form.slogan}
                  onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                  placeholder="Une phrase qui claque..."
                  className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Bio (optionnelle)</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner resize-none placeholder:text-slate-300"
                  placeholder="Présentez le candidat en quelques mots..."
                />
              </div>

              {/* Photo */}
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-2 mb-3 block">Photo du candidat</label>
                <div className="flex items-center gap-6">
                  <div
                    onClick={() => document.getElementById('cand-photo').click()}
                    className="w-24 h-24 rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-emerald-400 transition-all shadow-inner"
                  >
                    {form.preview ? (
                      <img src={form.preview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center">
                        <Camera className="mx-auto text-slate-300" size={28} />
                        <span className="text-[8px] font-black uppercase mt-1 block">Ajouter</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="cand-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  {form.preview && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photo: null, preview: null })}
                      className="text-red-500 text-xs font-bold hover:underline"
                    >
                      Supprimer la photo
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-slate-50 flex gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 font-black text-slate-400 text-[10px] hover:text-slate-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-emerald-500 py-5 rounded-[24px] text-white font-[900] text-[11px] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : editingCandidate ? (
                  <Save size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                {editingCandidate ? 'Enregistrer les modifications' : 'Ajouter le candidat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Candidats & scrutins</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Gérez les candidats et leur rattachement aux postes
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn h-14 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-2xl flex items-center gap-3 px-8 shadow-xl shadow-emerald-100 transition-all font-black text-xs"
          >
            <Plus size={20} /> Ajouter un candidat
          </button>
        </div>

        {/* Liste des candidats */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-20">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="font-bold text-xs">Chargement des candidats...</p>
            </div>
          ) : candidats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
              <p className="font-bold text-sm">Aucun candidat enregistré</p>
              <button onClick={openCreateModal} className="text-emerald-500 text-xs mt-2 hover:underline">
                Ajouter le premier candidat
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400">Photo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400">Candidat</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400">Poste</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400">Slogan</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {candidats.map((candidat) => (
                    <tr key={candidat.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-6 py-4">
                        <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
                          {candidat.photo_path ? (
                            <img
                              src={`${import.meta.env.VITE_STORAGE_URL}/${candidat.photo_path}`}
                              alt={candidat.user?.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : candidat.user?.photo ? (
                            <img
                              src={`${import.meta.env.VITE_STORAGE_URL}/${candidat.photo_path}`}
                              alt={candidat.user?.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 font-black text-sm">
                              {candidat.user?.nom?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm">
                          {candidat.user?.nom || `Utilisateur #${candidat.user_id}`}
                        </p>
                        <p className="text-[11px] text-slate-400">{candidat.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-800">
                          {candidat.position?.title || `Poste #${candidat.position_id}`}
                        </p>
                        <span className={`mt-1 px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${
                          candidat.position?.is_active == 1
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {candidat.position?.is_active == 1 ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 italic max-w-xs truncate">
                          {candidat.slogan || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(candidat)}
                            className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(candidat.id)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Candidats;