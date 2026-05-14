import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, CheckCircle, User, LogOut, Menu, X, Vote, TrendingUp, ShieldAlert } from 'lucide-react';
import { getConnectedUser } from '../utils/userHelper';
import authService from '../services/authService';

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord',    icon: LayoutDashboard, to: '/voterDashboard' },
  { id: 'scrutins',  label: 'Scrutins',           icon: Vote,            to: '/scrutins'       },
  { id: 'votes',     label: 'Mes Votes',          icon: CheckCircle,     to: '/voterHistory'   },
  { id: 'results',   label: 'Résultats',          icon: TrendingUp,      to: '/voter-results'  },
  { id: 'profile',   label: 'Profil',             icon: User,            to: '/voterProfile'   },
];

const NavItem = ({ item, isActive }) => (
  <Link
    to={item.to}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
      isActive ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'text-slate-400 hover:bg-slate-50'
    }`}
  >
    <item.icon size={18} />
    {item.label}
  </Link>
);

const ElectorLayout = ({ children, activePage = 'dashboard' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getConnectedUser();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authService.logout();
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 transition-opacity duration-500 ${isLoggingOut ? 'opacity-0' : 'opacity-100'}`}>

      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
          <ShieldAlert size={44} className="text-emerald-500 animate-bounce mb-4" />
          <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Fermeture de la session…</p>
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white p-6 flex flex-col gap-6 border-r border-slate-100 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-100">CTS</div>
            <span className="font-black tracking-tighter uppercase text-sm">CyberTech<span className="text-emerald-500">Squad</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 md:hidden hover:text-red-500"><X /></button>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activePage === item.id || location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="px-3 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-500 text-xs shrink-0">
              {user?.initials || '??'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-slate-800 truncate">{user?.fullName || 'Utilisateur'}</p>
              <p className="text-[9px] font-bold text-emerald-500">Électeur</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 p-4 text-red-400 font-bold text-xs uppercase tracking-widest border-t border-slate-50 pt-4 hover:bg-red-50 rounded-2xl transition-all active:scale-95 disabled:opacity-60"
        >
          <LogOut size={18} />
          {isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}
        </button>
      </aside>

      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 p-6 md:px-12 flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white rounded-xl text-slate-400 md:hidden border border-slate-100"><Menu /></button>

          <div className="flex items-center gap-4 bg-white p-1.5 pr-6 rounded-full shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 font-black text-sm shadow-inner">
              {user?.initials || '??'}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-800 leading-none">{user?.fullName || 'Utilisateur'}</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Électeur</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ElectorLayout;
