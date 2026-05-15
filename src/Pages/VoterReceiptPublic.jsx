import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ShieldCheck, Vote, User, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import logocts from '../assets/logo-cts2-removebg-preview.png';

const VoterReceiptPublic = () => {
  const { ref } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/receipts/${ref}`)
      .then(res => setData(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-16 h-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center">
        <Vote size={28} className="text-slate-200" />
      </div>
      <p className="font-black text-slate-400 text-sm">Reçu introuvable</p>
      <p className="text-slate-300 text-xs font-bold">La référence <code className="text-emerald-500">{ref}</code> ne correspond à aucun vote.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">

        {/* header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-8 text-center">
          <img src={logocts} alt="CTS" className="h-12 mx-auto mb-3" />
          <p className="text-white font-black text-lg">Reçu de vote</p>
          <p className="text-emerald-100 text-xs font-bold mt-1">Cyber Tech Squad — Scrutin sécurisé</p>
        </div>

        {/* body */}
        <div className="px-8 py-7 flex flex-col gap-5">

          {/* scrutin */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
            <Vote size={16} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Scrutin</p>
              <p className="text-sm font-black text-slate-800">{data.election_title}</p>
            </div>
          </div>

          {/* candidat */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
              {data.photo_path
                ? <img src={data.photo_path} className="w-full h-full object-cover" alt={data.candidat_name} />
                : <User size={20} className="text-slate-300" />
              }
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Candidat</p>
              <p className="text-sm font-black text-slate-800">{data.candidat_name}</p>
            </div>
          </div>

          {/* infos */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
              </div>
              <span className="text-xs font-bold text-slate-600">{data.date_voted}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Hash size={12} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</span>
              </div>
              <code className="bg-slate-900 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-xl tracking-widest">
                {data.ref}
              </code>
            </div>
          </div>

          {/* badge validé */}
          <div className="flex items-center gap-2 justify-center bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-600">Vote enregistré et vérifié</span>
          </div>
        </div>

        {/* footer */}
        <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-center gap-2">
          <ShieldCheck size={12} className="text-emerald-500" />
          <p className="text-[9px] font-bold text-slate-300">Registre audité — votes anonymisés par CTS</p>
        </div>
      </div>
    </div>
  );
};

export default VoterReceiptPublic;
