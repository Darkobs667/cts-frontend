import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import api from '../services/api';

const ProtectedRoute = ({ children, allowedRole }) => {
    const [status, setStatus] = useState('loading');
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (!token) { setStatus('unauthorized'); return; }

        api.get('/me')
            .then(res => {
                const user = res.data?.user;
                if (!user) { setStatus('unauthorized'); return; }

                // Toujours synchroniser le localStorage avec les données fraîches
                localStorage.setItem('user_data', JSON.stringify(user));

                // Vérifier que l'email est vérifié
                if (!user.email_verified_at) {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('user_tokenrefsh');
                    localStorage.removeItem('user_data');
                    setStatus('unauthorized');
                    return;
                }

                const role = user.role;
                setUserRole(role);
                setStatus(allowedRole && role !== allowedRole ? 'wrong_role' : 'ok');
            })
            .catch(() => {
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_tokenrefsh');
                localStorage.removeItem('user_data');
                setStatus('unauthorized');
            });
    }, [allowedRole]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'unauthorized') return <Navigate to="/login" replace />;

    if (status === 'wrong_role') {
        return userRole === 'admin'
            ? <Navigate to="/admin" replace />
            : <Navigate to="/voterDashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
