// src/Components/ProtectedRoute.jsx
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, isAdmin, isElecteur, loading } = useAuth();

    // Pendant la vérification, on affiche un loader
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Vérification des accès...</p>
                </div>
            </div>
        );
    }

    // Pas d'utilisateur connecté
    if (!user) {
        console.log("Accès refusé : Aucun utilisateur authentifié.");
        return <Navigate to="/login" replace />;
    }

    // Vérification basée sur les données du SERVEUR, pas du localStorage
    if (allowedRole === 'admin' && !isAdmin) {
        console.warn(`Accès admin refusé pour ${user.email} (rôle réel: ${user.role})`);
        return <Navigate to="/voterDashboard" replace />;
    }

    if (allowedRole === 'electeur' && !isElecteur && !isAdmin) {
        console.warn(`Accès électeur refusé pour ${user.email}`);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;