import { Routes, Route, Navigate } from "react-router"; // Utilise react-router-dom pour la stabilité
import LoginCTS from './Pages/Login.jsx';
import Adminpage from "./Pages/Admin.jsx";
import SignUp from './Pages/signup.jsx';
import Votes from './Pages/Votes.jsx';
import Electeurs from './Pages/Electeurs.jsx';
import Candidats from './Pages/Settings.jsx';
import VoterDashboard from './Pages/VoterDashboard.jsx';
import VoterChoice from './Components/VoterChoice.jsx';
import VoterRecap from './Components/VoterRecap.jsx';
import VoterHistory from './Pages/VoterHistory.jsx';
import VoterProfile from './Pages/VoterProfile.jsx';
import AdminresultsPage from './Pages/adminresult.jsx';
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import ElecteurScrutins from "./Pages/ElecteurScrutins.jsx";
import AdminCandidatures from "./Pages/AdminCandidatures.jsx";

function App() {
  return (
    <Routes>
      {/* --- ROUTES PUBLIQUES (Accessibles à tous) --- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginCTS />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* --- ROUTES ÉLECTEURS (Protégées par rôle 'electeur') --- */}
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
      
      {/* --- ROUTES ADMIN (Protégées par rôle 'admin') --- */}
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

      {/* Redirection si la route n'existe pas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;