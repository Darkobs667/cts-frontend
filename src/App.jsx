// src/App.jsx
import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from 'react';
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { useAuth } from './hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from './Components/Loading';

const LoginCTS = lazy(() => import('./Pages/Login.jsx'));
const SignUp = lazy(() => import('./Pages/signup.jsx'));
const Adminpage = lazy(() => import('./Pages/Admin.jsx'));
const Votes = lazy(() => import('./Pages/Votes.jsx'));
const Electeurs = lazy(() => import('./Pages/Electeurs.jsx'));
const Candidats = lazy(() => import('./Pages/Settings.jsx'));
const VoterDashboard = lazy(() => import('./Pages/VoterDashboard.jsx'));
const VoterChoice = lazy(() => import('./Components/VoterChoice.jsx'));
const VoterBallot = lazy(() => import('./Pages/VoterBallot.jsx'));
const VoterRecap = lazy(() => import('./Components/VoterRecap.jsx'));
const VoterHistory = lazy(() => import('./Pages/VoterHistory.jsx'));
const VoterProfile = lazy(() => import('./Pages/VoterProfile.jsx'));
const AdminresultsPage = lazy(() => import('./Pages/adminresult.jsx'));
const ElecteurScrutins = lazy(() => import('./Pages/ElecteurScrutins.jsx'));
const AdminCandidatures = lazy(() => import('./Pages/AdminCandidatures.jsx'));

const PageLoader = () => (
    <div className="min-h-screen bg-slate-50"><Loading text="Chargement de la page…" className="min-h-screen" /></div>
);

function AppContent() {
    const { loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50"><Loading text="Chargement de votre session…" className="min-h-screen" /></div>
        );
    }
    
    return (
        <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginCTS />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/voterDashboard" element={
                <ProtectedRoute allowedRole="electeur">
                    <VoterDashboard />
                </ProtectedRoute>
            } />
            <Route path="/voterChoice" element={
                <ProtectedRoute allowedRole="electeur">
                    <VoterChoice />
                </ProtectedRoute>
            } />
            <Route path="/voterBallot" element={
                <ProtectedRoute allowedRole="electeur">
                    <VoterBallot />
                </ProtectedRoute>
            } />
            <Route path="/voterRecap" element={
                <ProtectedRoute allowedRole="electeur">
                    <VoterRecap />
                </ProtectedRoute>
            } />
            <Route path="/voterHistory" element={
                <ProtectedRoute allowedRole="electeur">
                    <VoterHistory />
                </ProtectedRoute>
            } />
            <Route path="/voterProfile" element={
                <ProtectedRoute allowedRole="electeur">
                    <VoterProfile />
                </ProtectedRoute>
            } />
            <Route path="/scrutins" element={
                <ProtectedRoute allowedRole="electeur">
                    <ElecteurScrutins />
                </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
                <ProtectedRoute allowedRole="admin">
                    <Adminpage />
                </ProtectedRoute>
            } />
            <Route path="/candidatures" element={
                <ProtectedRoute allowedRole="admin">
                    <AdminCandidatures />
                </ProtectedRoute>
            } />
            <Route path="/votes-elections" element={
                <ProtectedRoute allowedRole="admin">
                    <Votes />
                </ProtectedRoute>
            } />
            <Route path="/candidats" element={
                <ProtectedRoute allowedRole="admin">
                    <Candidats />
                </ProtectedRoute>
            } />
            <Route path="/electeurs" element={
                <ProtectedRoute allowedRole="admin">
                    <Electeurs />
                </ProtectedRoute>
            } />
            <Route path="/adminresultsPage" element={
                <ProtectedRoute allowedRole="admin">
                    <AdminresultsPage />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </motion.div>
        </AnimatePresence>
        </Suspense>
    );
}

function App() { return <AppContent />; }

export default App;
