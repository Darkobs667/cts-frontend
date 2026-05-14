import { useState, useEffect } from 'react';
import AdminLayout from '../Components/AdminLayout';
import { Plus, Copy, Check, Trash2, Loader2, KeyRound, UserCheck, Clock } from 'lucide-react';
import api from '../services/api';

const InviteCodes = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [quantity, setQuantity] = useState(10);
    const [copied, setCopied] = useState(null);

    const fetchCodes = async () => {
        try {
            const res = await api.get('/invite-codes');
            setCodes(res.data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCodes(); }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post('/invite-codes/generate', { quantity });
            await fetchCodes();
        } catch (e) {
            alert('Erreur lors de la génération.');
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/invite-codes/${id}`);
            setCodes(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            alert(e.response?.data?.message || 'Erreur suppression.');
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleCopyAll = () => {
        const unused = codes.filter(c => !c.used).map(c => c.code).join('\n');
        navigator.clipboard.writeText(unused);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    const unused = codes.filter(c => !c.used).length;
    const used = codes.filter(c => c.used).length;

    return (
        <AdminLayout activePage="invite-codes">
            <div className="max-w-4xl mx-auto">

                {/* header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900">Codes d'invitation</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Générez et distribuez les codes aux membres du club pour qu'ils puissent s'inscrire
                    </p>
                </div>

                {/* stats + generate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <KeyRound size={18} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disponibles</p>
                            <p className="text-2xl font-black text-slate-900">{unused}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                            <UserCheck size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilisés</p>
                            <p className="text-2xl font-black text-slate-900">{used}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            <p className="text-2xl font-black text-slate-900">{codes.length}</p>
                        </div>
                    </div>
                </div>

                {/* generate bar */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <label className="text-xs font-black text-slate-600 shrink-0">Générer</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            className="w-20 h-10 text-center bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <label className="text-xs font-black text-slate-600 shrink-0">codes</label>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {unused > 0 && (
                            <button
                                onClick={handleCopyAll}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 font-black text-[11px] hover:bg-slate-100 transition-all"
                            >
                                {copied === 'all' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                Copier tous
                            </button>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-60"
                        >
                            {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Générer
                        </button>
                    </div>
                </div>

                {/* codes list */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    ) : codes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 bg-slate-50 rounded-[22px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                                <KeyRound size={22} className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-black text-sm">Aucun code généré</p>
                            <p className="text-slate-300 font-bold text-[10px] mt-1">Cliquez sur "Générer" pour créer des codes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {codes.map(c => (
                                <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-black text-base tracking-widest ${c.used ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                                            {c.code}
                                        </span>
                                        {c.used ? (
                                            <span className="text-[9px] font-black text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                                                Utilisé · {c.used_by_user ? `${c.used_by_user.first_name} ${c.used_by_user.last_name}` : ''}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                                Disponible
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!c.used && (
                                            <button
                                                onClick={() => handleCopy(c.code)}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                                            >
                                                {copied === c.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                        {!c.used && (
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default InviteCodes;
