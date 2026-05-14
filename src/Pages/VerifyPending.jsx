import { MailCheck } from 'lucide-react';
import { Link } from 'react-router';
import logocts from "../assets/logo-cts2-removebg-preview.png";

const VerifyPending = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans text-slate-800">
        <img src={logocts} alt="logo" className="w-20 h-20 object-contain mb-6" />
        <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl p-10 border border-slate-50 text-center">
            <div className="flex justify-center mb-4">
                <MailCheck size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Vérifiez votre email</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
                Un lien de confirmation a été envoyé à votre adresse <span className="font-bold text-slate-700">@uadb.edu.sn</span>.
                <br /><br />
                Cliquez sur le lien dans l'email pour activer votre compte.
            </p>
            <p className="text-xs text-slate-400 mt-6">
                Déjà vérifié ? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Se connecter</Link>
            </p>
        </div>
    </div>
);

export default VerifyPending;
