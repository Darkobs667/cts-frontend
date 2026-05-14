import { useState } from 'react';
import { MailCheck, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import logocts from "../assets/logo-cts2-removebg-preview.png";
import api from '../services/api';

const VerifyPending = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('Impossible de renvoyer l\'email. Réessayez plus tard.');

    const handleResend = async () => {
        if (!email) {
            setStatus('error');
            setErrorMsg("Email introuvable. Retournez à l'inscription.");
            return;
        }
        setStatus('loading');
        try {
            await api.post('/resend-verification', { email });
            setStatus('sent');
        } catch (err) {
            setStatus('error');
            if (err?.response?.status === 404) setErrorMsg("Email déjà vérifié ou introuvable.");
            else if (err?.response?.status === 500) setErrorMsg("Erreur serveur. Réessayez dans quelques instants.");
            else setErrorMsg("Impossible d'envoyer l'email. Vérifiez votre connexion.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans text-slate-800">
            <img src={logocts} alt="logo" className="w-20 h-20 object-contain mb-6" />
            <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl p-10 border border-slate-50 text-center">
                <div className="flex justify-center mb-4">
                    <MailCheck size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-3">Vérifiez votre email</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Un lien de confirmation a été envoyé à votre adresse email.
                    <br /><br />
                    Cliquez sur le lien dans l'email pour activer votre compte.
                </p>

                {status === 'sent' && (
                    <p className="mt-4 text-emerald-600 text-xs font-black bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                        Email renvoyé avec succès !
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 text-red-500 text-xs font-black bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                        {errorMsg}
                    </p>
                )}

                <button
                    onClick={handleResend}
                    disabled={status === 'loading' || status === 'sent'}
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 font-black text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} />
                    {status === 'loading' ? 'Envoi…' : 'Renvoyer l\'email'}
                </button>

                <p className="text-xs text-slate-400 mt-4">
                    Déjà vérifié ? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyPending;
