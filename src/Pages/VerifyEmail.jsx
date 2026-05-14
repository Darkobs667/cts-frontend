import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        api.get(`/verify-email/${token}`)
            .then(() => {
                setStatus('success');
                setTimeout(() => navigate('/login'), 3000);
            })
            .catch(() => setStatus('error'));
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <div className="text-center p-10">
                {status === 'loading' && <span className="loading loading-spinner text-emerald-500 w-12"></span>}
                {status === 'success' && (
                    <>
                        <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-900">Email vérifié !</h2>
                        <p className="text-slate-500 mt-2 text-sm">Redirection vers la connexion...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={56} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-900">Lien invalide</h2>
                        <p className="text-slate-500 mt-2 text-sm">Ce lien est expiré ou déjà utilisé.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
