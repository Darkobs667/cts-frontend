// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isElecteur, setIsElecteur] = useState(false);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    const loadUserFromServer = useCallback(async () => {
        const token = localStorage.getItem('user_token');
        
        if (!token) {
            setLoading(false);
            setUser(null);
            setIsAdmin(false);
            setIsElecteur(false);
            setRole(null);
            return;
        }

        try {
            // Appel à la nouvelle route backend pour vérifier le VRAI rôle
            const response = await api.get('/auth/verify-role', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                setRole(userData.role);
                setIsAdmin(userData.role === 'admin');
                setIsElecteur(userData.role === 'electeur');
                
                // Mise à jour sécurisée (sans stocker le rôle en clair modifiable)
                // On ne stocke que ce qui est nécessaire dans localStorage
                localStorage.setItem('user_id', userData.id);
                // NE PAS stocker user_data avec le rôle !
            } else {
                // Token invalide, on nettoie
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_tokenrefsh');
                setUser(null);
                setIsAdmin(false);
                setIsElecteur(false);
                setRole(null);
            }
        } catch (error) {
            console.error('Erreur vérification rôle:', error);
            // En cas d'erreur, on considère que l'utilisateur n'est pas authentifié
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_tokenrefsh');
            setUser(null);
            setIsAdmin(false);
            setIsElecteur(false);
            setRole(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserFromServer();
    }, [loadUserFromServer]);

    const logout = useCallback(() => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_tokenrefsh');
        localStorage.removeItem('user_id');
        setUser(null);
        setRole(null);
        setIsAdmin(false);
        setIsElecteur(false);
    }, []);

    const refreshUser = useCallback(() => {
        setLoading(true);
        loadUserFromServer();
    }, [loadUserFromServer]);

    return { user, isAdmin, isElecteur, role, loading, logout, refreshUser };
};