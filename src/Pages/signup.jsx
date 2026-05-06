import React, { useState } from 'react';
import { User, MailQuestionMark, Lock, Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from "react-router";
import logocts from "../assets/logo-cts2-removebg-preview.png";
import authService  from '../services/authService'; // Assure-toi que ce service existe

const SignUp = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const validateField = (name, value) => {
        let errorMsg = '';

        if (name === 'email') {
            // REGEX STRICTE : n'autorise que le domaine @uadb.edu.sn
            const uadbRegex = /^[^\s@]+@uadb\.edu\.sn$/;
            if (value && !uadbRegex.test(value)) {
                errorMsg = "Seules les adresses @uadb.edu.sn sont autorisées.";
            }
        }

        if (name === 'password') {
            if (value && value.length < 8) {
                errorMsg = "Le mot de passe doit contenir au moins 8 caractères.";
            }
        }

        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
        setServerError('');
    };

   const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Protection contre les doubles clics
        if (loading) return;
        setLoading(true);
        setServerError('');

        // 2. Préparation sécurisée des données
        // On crée l'objet en s'assurant que les valeurs ne sont pas undefined
        const dataForLaravel = {
            first_name: formData.prenom || '', 
            last_name: formData.nom || '',     
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password,
            code: null // 
        };

        // 3. LOG DE DÉBOGAGE 
        console.log("TS-LOG: Tentative d'envoi vers Laravel...", dataForLaravel);

        try {
           
            const response = await authService.register(dataForLaravel);
            
            console.log("TS-LOG: Succès Backend !", response);
            alert("Félicitations ! Votre compte CYBER TECH SQUAD est créé.");
            navigate('/login');
            
        } catch (error) {
            // On récupère le message d'erreur précis du serveur s'il existe
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Erreur de connexion au serveur.";
            console.error("TS-LOG: Échec de l'inscription :", errorMsg);
            
            setServerError(`Erreur : ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans text-slate-800">
            {/* Logo et Titre */}
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center">
                        <img src={logocts} alt='logo cts' className="w-20 h-20 object-contain"  />
                    </div>
                </div>
                <h1 className="text-2xl font-black  uppercase text-slate-900">CYBER TECH SQUAD</h1>
                <p className="text-slate-500 mt-2 font-medium">Créez votre compte électoral</p>
            </div>

            {/* Carte du Formulaire */}
            <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]
             rounded-3xl p-8 border border-slate-50">
                
                {serverError && (
                    <div className="mb-4 p-3 bg-red-50 text-emerald-400 
                    rounded-xl text-xs font-bold border border-red-100 text-center">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="flex gap-4">
                        <div className="form-control w-1/2">
                            <label className="label py-0 mb-2 text-xs font-semibold text-slate-900">Prénom</label>
                            <input
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange} 
                                type="text" 
                                placeholder="Alioune" 
                                className="input w-full h-12 pl-4 bg-slate-50 border-none 
                                focus:ring-2 focus:ring-emerald-400 rounded-xl
                                 text-slate-700 transition-all font-medium"
                                required
                            />
                        </div>
                        <div className="form-control w-1/2">
                            <label className="label py-0 mb-2 text-xs font-semibold text-slate-900">Nom</label>
                            <input 
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                type="text" 
                                placeholder="Diop" 
                                className="input w-full h-12 pl-4 bg-slate-50 
                                border-none focus:ring-2 focus:ring-emerald-400 
                                rounded-xl text-slate-700 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-control w-full">
                        <label className="label py-0 mb-2 text-xs font-semibold text-slate-900">Email Académique</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                                <MailQuestionMark size={18} />
                            </div>
                            <input 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email" 
                                placeholder="prenom.nom@uadb.edu.sn" 
                                className="input w-full h-14 pl-12 bg-slate-50
                                 border-none focus:ring-2 focus:ring-emerald-400
                                  rounded-2xl text-slate-700 transition-all font-medium" 
                                required
                            />
                        </div>
                        {errors.email && <span className="text-emerald-400 text-[10px] font-bold mt-1 ml-2">{errors.email}</span>}
                    </div>

                    <div className="form-control w-full">
                        <label className="label py-0 mb-2 text-xs font-semibold text-slate-900">Mot de Passe</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center
                             pointer-events-none text-slate-400
                              group-focus-within:text-emerald-500 transition-colors z-10">
                                <Lock size={18} />
                            </div>
                            <input 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••••••" 
                                className="input w-full h-14 pl-12 pr-12 bg-slate-50 
                                border-none focus:ring-2 focus:ring-emerald-400 
                                rounded-2xl text-slate-700 transition-all" 
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-4 flex 
                                items-center z-20 text-slate-400 hover:text-emerald-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <span className="text-emerald-400 text-[10px] font-bold mt-1 ml-2">{errors.password}</span>}
                    </div>

                    <button 
                        disabled={loading || errors.email || errors.password || !formData.email}
                        type='submit'
                        className="btn btn-primary w-full h-14 bg-[#00d991]
                         hover:bg-[#00c282] border-none text-slate-900
                          font-bold normal-case rounded-2xl flex items-center
                           justify-center gap-3 shadow-lg shadow-emerald-100 mt-4 transition-all"
                    >
                        {loading ? <span className="loading loading-spinner"></span> : <><UserPlus size={20} /> Créer mon compte</>}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    Déjà inscrit ? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Se connecter</Link>
                </p>
            </div>

            <div className="mt-12 flex items-center gap-2 px-4 py-2 border border-emerald-100 rounded-full bg-emerald-50/50">
                <ShieldCheck className="text-emerald-500" size={16} />
                <span className="text-[10px] font-black text-emerald-600 uppercase">Technologie-Sécurité-Innovation</span>
            </div>
        </div>
    );
};

export default SignUp;