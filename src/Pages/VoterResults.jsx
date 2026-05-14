import { useState, useEffect, useRef } from 'react';
import VoterLayout from '../Components/VoterLayout';
import { User, Trophy, Vote, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../services/api';

const AnimatedBar = ({ pct, isWinner }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="ml-12 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-slate-300'}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

const ResultCard = ({ election, index }) => {
    const sorted = [...(election.candidates || [])].sort((a, b) => b.votes_count - a.votes_count);
    const total = election.total_votes || 0;
    const winner = sorted[0];

    return (
        <div
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden fade-up"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Vote size={15} className="text-slate-400" />
                    </div>
                    <div>
                        <h3 className="font-[900] text-slate-900 text-sm leading-tight">{election.title}</h3>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5">{total} vote{total !== 1 ? 's' : ''} enregistré{total !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black bg-slate-50 text-slate-400 border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Clôturé
                </span>
            </div>

            {/* winner */}
            {winner && winner.votes_count > 0 && (
                <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-3">
                    <Trophy size={14} className="text-emerald-500 shrink-0" />
                    <p className="text-[10px] font-black text-emerald-700">
                        Élu — <span className="text-emerald-600">{winner.name}</span>
                    </p>
                </div>
            )}

            {/* candidates */}
            <div className="px-6 py-5 space-y-4">
                {sorted.map((c, i) => {
                    const pct = total > 0 ? ((c.votes_count / total) * 100).toFixed(1) : 0;
                    const isWinner = i === 0 && c.votes_count > 0;
                    return (
                        <div key={c.id}>
                            <div className="flex items-center gap-3 mb-1.5">
                                <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border-2 ${isWinner ? 'border-emerald-400' : 'border-slate-100'}`}>
                                    {c.photo_path ? (
                                        <img src={`${import.meta.env.VITE_STORAGE_URL}/${c.photo_path}`} className="w-full h-full object-cover" alt={c.name} />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <User size={14} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <span className={`flex-1 text-sm font-[900] ${isWinner ? 'text-emerald-700' : 'text-slate-700'}`}>{c.name}</span>
                                <span className={`text-sm font-black tabular-nums ${isWinner ? 'text-emerald-600' : 'text-slate-400'}`}>{pct}%</span>
                            </div>
                        <AnimatedBar pct={pct} isWinner={isWinner} />
                        </div>
                    );
                })}

                {sorted.length === 0 && (
                    <p className="text-center text-slate-300 font-black text-xs py-4">Aucun candidat</p>
                )}
            </div>
        </div>
    );
};

const VoterResults = () => {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);

    useEffect(() => {
        api.get('/votes/results')
            .then(res => {
                const data = res.data?.data || [];
                const closed = Array.isArray(data)
                    ? data.filter(e => e.is_active === false || e.is_active === 0)
                    : [];
                setResults(closed);
            })
            .catch(err => console.error('Erreur résultats:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <VoterLayout activePage="results">
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp .42s ease both; }
            `}</style>

            <div className="max-w-3xl mx-auto pb-20">
                <div className="mb-8 fade-up">
                    <h1 className="text-xl md:text-2xl font-[900] text-slate-900">Résultats des scrutins</h1>
                    <p className="text-slate-400 text-xs font-medium mt-1">Scrutins clôturés et résultats officiels</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                            <TrendingUp className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase animate-pulse">
                            Chargement des résultats…
                        </p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm fade-up">
                        <div className="w-16 h-16 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                            <Trophy size={24} className="text-slate-200" />
                        </div>
                        <p className="font-black text-slate-400 text-sm">Aucun résultat disponible</p>
                        <p className="text-slate-300 font-bold text-[10px] mt-1">Les résultats apparaîtront après la clôture des scrutins</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {results.map((election, i) => (
                            <ResultCard key={election.id} election={election} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </VoterLayout>
    );
};

export default VoterResults;
