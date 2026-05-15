/**
 * Retourne l'URL complète d'une photo candidat.
 * photo_path est soit une data URI base64, soit un chemin relatif storage.
 */
export const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('data:')) return photoPath;
    return `${import.meta.env.VITE_STORAGE_URL}/${photoPath}`;
};

export const getConnectedUser = () => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;

    try {
        const user = JSON.parse(userData);
        const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
        return {
            ...user,
            fullName: `${user.first_name} ${user.last_name}`,
            initials,
        };
    } catch {
        localStorage.removeItem('user_data');
        return null;
    }
};