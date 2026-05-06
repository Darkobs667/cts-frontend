import { Navigate } from 'react-router';

const ProtectedRoute = ({ children, allowedRole }) => {
    // Synchronisation avec les clés définies dans ton authService
    const token = localStorage.getItem('user_token');
    const user = JSON.parse(localStorage.getItem('user_data'));

    // 1. Si pas de token, on redirige vers le login
    if (!token) {
        console.log("Accès refusé : Aucun token trouvé.");
        return <Navigate to="/login" replace />;
    }

    // 2. Si un rôle spécifique est requis et que l'utilisateur ne l'a pas
    if (allowedRole && user?.role !== allowedRole) {
        console.warn(`Rôle insuffisant. Attendu: ${allowedRole}, Reçu: ${user?.role}`);
        
        // Sécurité pour éviter les boucles infinies : 
        // Si un admin essaie d'aller sur une page électeur ou vice-versa
        return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/voterDashboard" replace />;
    }

    // 3. Si tout est bon, on affiche la page
    return children;
};

export default ProtectedRoute;