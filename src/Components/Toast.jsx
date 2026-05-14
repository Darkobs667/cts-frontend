import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-4 duration-300
            ${type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-red-100 text-red-600'}`}>
            {type === 'success'
                ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                : <XCircle size={18} className="text-red-400 shrink-0" />
            }
            <span className="text-xs font-black">{message}</span>
            <button onClick={onClose} className="ml-2 text-slate-300 hover:text-slate-500 transition-colors">
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
