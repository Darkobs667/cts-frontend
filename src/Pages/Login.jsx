import { User, Lock, LogIn, ShieldCheck, Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from "react-router"; 
import authService  from '../services/authService'; // Import du nouveau service
import logocts from "../assets/logo-cts2-removebg-preview.png";

const LoginCTS = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // État pour le bouton de chargement
  const [serverError, setServerError] = useState(''); // Erreur venant de l'API Laravel

  const [formData, setFormData] = useState({
    identifiant: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    identifiant: '',
    password: ''
  });

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'identifiant') {
      // REGEX STRICTE : n'autorise que le domaine @uadb.edu.sn
            const uadbRegex = /^[^\s@]+@uadb\.edu\.sn$/;
            if (value && !uadbRegex.test(value)) {
                errorMsg = "Seules les adresses @uadb.edu.sn sont autorisées.";
            }
    }
    if (name === 'password') {
      if (value && value.length < 8) {
        errorMsg = "Minimum 8 caractères requis.";
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    setServerError(''); // On efface l'erreur serveur quand l'utilisateur retape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');

    try {
      // 1. Appel au service (on garde ta logique d'envoi)
      const response = await authService.login({
        email: formData.identifiant,
        password: formData.password
      });

      console.log("Connexion réussie :", response);

      // 2. STOCKAGE DU TOKEN ET DES INFOS (Indispensable pour rester connecté)
      // On se base sur la réponse Postman : response.data contient access_token et user
      if (response.data && response.data.access_token) {
        console.log("token bien reçu !")
        localStorage.setItem('user_token', response.data.access_token);
        localStorage.setItem('user_tokenrefsh', response.data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        // 3. REDIRECTION DYNAMIQUE
        // On vérifie le rôle pour diriger au bon endroit
        const userRole = response.data.user.role; 
        console.log("Contenu du role :", userRole);
        
        if (userRole === 'admin') {
        navigate('/admin');
        } else if (userRole === 'electeur') {
        navigate('/voterDashboard');
        } else {
        // Redirection de secours si le rôle est différent
        navigate('/voterDashboard');
        }
        } else {
        setServerError("Erreur : Token non reçu du serveur.");
        }

    } catch (error) {
      console.error("Erreur de connexion :", error);
      // On récupère le message d'erreur précis du backend si possible
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Identifiants incorrects.";
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans text-slate-800">
      
      {/* Logos et Titres */}
      <div className="text-center mb-10 space-y-4">
        <div className="flex justify-center gap-6 mb-6">
          <img src={logocts} alt="Logo CTS" className="h-20 w-auto" />
        </div>
        <h1 className="text-2xl font-black uppercase text-slate-900">CYBER TECH SQUAD</h1>
        <p className="text-slate-500 font-medium">Accédez à votre espace de vote</p>
      </div>

      <div className="card w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]
       rounded-3xl p-10 border border-slate-50">
        
        {/* Message d'erreur général du serveur */}
        {serverError && (
          <div className="bg-red-50 text-emerald-400 p-3 rounded-xl text-xs font-bold mb-6
           text-center border border-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Identifiant (Email) */}
          <div className="form-control w-full">
            <label className="label py-0 mb-2">
              <span className="label-text text-xs font-semibold text-slate-900">Email</span>
            </label>
            <div className="relative group">
              <div className="absolute z-10 inset-y-0 left-4 flex items-center
               pointer-events-none text-slate-400 group-focus-within:text-emerald-500 
               transition-colors">
                <Mail size={18}/>
              </div>
              <input 
                name="identifiant"
                value={formData.identifiant}
                onChange={handleChange}
                type="email" 
                placeholder="prenom.nom@uadb.edu.sn" 
                className="input w-full h-14 pl-12 bg-slate-50 border-none
                 focus:ring-2 focus:ring-emerald-400 rounded-2xl
                  text-slate-700 placeholder:text-slate-300 transition-all font-medium" 
                required
              />
            </div>
            {errors.identifiant && <span className="text-emerald-400 text-[10px] font-bold mt-1 ml-2">{errors.identifiant}</span>}
          </div>

          {/* Mot de Passe */}
          <div className="form-control w-full">
            <label className="label py-0 mb-2">
              <span className="label-text text-xs font-semibold text-slate-900">Mot de Passe</span>
            </label>
            <div className="relative group">
              <div className="absolute z-10 inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={18}/>
              </div>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                className="input w-full h-14 pl-12 bg-slate-50 border-none focus:ring-2
                 focus:ring-emerald-400 rounded-2xl text-slate-700
                  placeholder:text-slate-300 transition-all" 
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 z-20"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="text-emerald-400  text-[10px] font-bold mt-1 ml-2">{errors.password}</span>}
          </div>

          <button 
            disabled={loading || errors.identifiant || errors.password || !formData.identifiant}
            className={`btn w-full h-14 ${loading ? 'bg-slate-200' : 
              'bg-[#00d991] hover:bg-[#00c282]'} border-none
               text-slate-900 font-bold normal-case rounded-2xl 
               gap-3 shadow-lg flex items-center justify-center shadow-emerald-100 mt-4 transition-all`}
            type="submit"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <><LogIn size={20} /> Se connecter</>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Pas encore inscrit ? <Link to="/signup" className="text-emerald-600 font-bold hover:underline">S'inscrire</Link>
        </p>
      </div>

      <div className="mt-12 flex items-center gap-2 text-[10px] font-black text-emerald-500
       bg-emerald-50/50 px-4 py-2 rounded-full border border-emerald-100">
        <ShieldCheck size={14} />
         TECHNOLOGIE-SÉCURITÉ-INNOVATION
      </div>
    </div>
  );
};

export default LoginCTS;