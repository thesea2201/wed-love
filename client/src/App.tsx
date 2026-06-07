import { Routes, Route, Navigate } from 'react-router-dom';
import InvitationView from './pages/InvitationView';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import DemoView from './pages/DemoView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/invitation/:slug" element={<InvitationView />} />
      <Route path="/demo/:templateId" element={<DemoView />} />
    </Routes>
  );
}

export default App;
